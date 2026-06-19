-- =============================================================================
--  BLUE SENIOR LIVING — Agenda de visitas: garantia anti-overbooking + reabertura
-- -----------------------------------------------------------------------------
--  ONDE RODAR
--  No Supabase do APP (projeto hqfrxdwumyyujewjgxgc) — é o MESMO banco que o site
--  lê/grava (fonte única da agenda). Supabase → SQL Editor → cole TUDO → Run.
--  É idempotente: pode rodar quantas vezes quiser, sem duplicar nada.
--
--  POR QUE PRECISA SER NO BANCO
--  O site usa a chave PÚBLICA (anon), que por segurança (RLS) só LÊ a
--  disponibilidade e INSERE agendamentos. Ela NÃO pode marcar horário como
--  ocupado nem contar agendamentos. Logo, a regra "reservou → some para os
--  demais" precisa viver aqui — senão dois navegadores diferentes ainda
--  conseguiriam pegar o mesmo horário.
--
--  O QUE ESTE SCRIPT INSTALA
--   1) visita_ocupacao(data,hora)  -> conta agendamentos ATIVOS de um horário.
--   2) Gatilho ao AGENDAR (insert) -> trava o slot, recusa se cheio (sem
--      overbooking) e marca bloqueada=true quando enche (some do site na hora).
--   3) Gatilho ao CANCELAR (update p/ cancelado, ou delete) -> reabre o slot
--      automaticamente — MAS só o que foi fechado pelo próprio agendamento
--      (não desfaz bloqueios manuais da gestão, ex.: feriado/manutenção).
--
--  >> AJUSTE IMPORTANTE: status de cancelamento <<
--  Não tenho como ler os valores reais de "status" (a RLS bloqueia leitura).
--  A lista abaixo cobre os nomes mais comuns (PT e EN, sem diferenciar
--  maiúsculas). Se o seu app usar outro termo para "cancelado/recusado",
--  acrescente na função visita_ocupacao (única lista, num lugar só).
-- =============================================================================

-- 1) Ocupação ATIVA de um horário (ignora cancelados/recusados) -----------------
create or replace function public.visita_ocupacao(p_data date, p_hora time)
returns integer
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select count(*)::int
    from public.visita_agendamento
   where data = p_data
     and hora = p_hora
     and lower(coalesce(status::text, 'pendente')) not in (
       'cancelada', 'cancelado', 'recusada', 'recusado',
       'desmarcada', 'desmarcado', 'cancelled', 'canceled'
     );
$$;

-- 2) Ao AGENDAR: serializa, impede overbooking e bloqueia o slot cheio ----------
create or replace function public.visita_agendamento_guard()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id   uuid;
  v_cap  integer;
  v_used integer;
begin
  -- Encontra e TRAVA o slot correspondente (serializa pedidos simultâneos).
  select id, coalesce(capacidade, 1)
    into v_id, v_cap
    from public.visita_disponibilidade
   where data = NEW.data and hora = NEW.hora
   for update;

  -- Sem slot gerenciado para este horário: não interfere (fluxos próprios do app).
  if v_id is null then
    return NEW;
  end if;

  v_used := public.visita_ocupacao(NEW.data, NEW.hora);

  -- Já cheio: recusa (impede overbooking). O site mostra "horário já reservado".
  if v_used >= v_cap then
    raise exception 'Horário % %h já está reservado.', NEW.data, NEW.hora
      using errcode = 'check_violation';
  end if;

  -- Este agendamento enche o slot? Some do site até o app reabrir.
  if v_used + 1 >= v_cap then
    update public.visita_disponibilidade
       set bloqueada = true,
           motivo_bloqueio = coalesce(motivo_bloqueio, 'Reservado por agendamento (site)')
     where id = v_id;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_visita_agendamento_guard on public.visita_agendamento;
create trigger trg_visita_agendamento_guard
  before insert on public.visita_agendamento
  for each row
  execute function public.visita_agendamento_guard();

-- 3) Reabre um slot se ele tiver vaga de novo (só o que o agendamento fechou) ----
create or replace function public.visita_reabrir_slot(p_data date, p_hora time)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id   uuid;
  v_cap  integer;
  v_used integer;
begin
  select id, coalesce(capacidade, 1)
    into v_id, v_cap
    from public.visita_disponibilidade
   where data = p_data and hora = p_hora
   for update;
  if v_id is null then
    return;
  end if;

  v_used := public.visita_ocupacao(p_data, p_hora);

  if v_used < v_cap then
    update public.visita_disponibilidade
       set bloqueada = false,
           motivo_bloqueio = null
     where id = v_id
       and bloqueada = true
       and motivo_bloqueio = 'Reservado por agendamento (site)'; -- não toca bloqueio manual
  end if;
end;
$$;

-- Ao CANCELAR (update p/ status cancelado) ou DELETAR um agendamento, reabre.
create or replace function public.visita_agendamento_on_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if (TG_OP = 'DELETE') then
    perform public.visita_reabrir_slot(OLD.data, OLD.hora);
    return OLD;
  end if;

  -- UPDATE: reabre o horário atual e, se a visita foi remarcada para outro
  -- dia/hora, reabre também o horário antigo.
  perform public.visita_reabrir_slot(NEW.data, NEW.hora);
  if (OLD.data is distinct from NEW.data) or (OLD.hora is distinct from NEW.hora) then
    perform public.visita_reabrir_slot(OLD.data, OLD.hora);
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_visita_agendamento_reopen on public.visita_agendamento;
create trigger trg_visita_agendamento_reopen
  after update or delete on public.visita_agendamento
  for each row
  execute function public.visita_agendamento_on_change();

-- =============================================================================
--  PRONTO. A partir daqui:
--   - Reservou um horário  -> ele some do site para todos (bloqueada = true).
--   - Cancelou/apagou      -> o horário volta a aparecer sozinho (se tinha vaga).
--   - Bloqueio manual      -> continua intocado (feriado, manutenção, etc.).
--
--  Reabertura manual (se precisar forçar):
--    UPDATE public.visita_disponibilidade
--       SET bloqueada = false, motivo_bloqueio = NULL
--     WHERE data = '2026-06-26' AND hora = '10:00:00';
-- =============================================================================
