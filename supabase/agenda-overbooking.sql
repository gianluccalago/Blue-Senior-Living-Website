-- =============================================================================
--  BLUE SENIOR LIVING — Garantia contra overbooking (agenda de visitas)
-- -----------------------------------------------------------------------------
--  POR QUE ISSO EXISTE
--  O site institucional usa a chave PÚBLICA (anon) do Supabase. Por segurança
--  (RLS), essa chave só pode: LER "visita_disponibilidade" e INSERIR em
--  "visita_agendamento". Ela NÃO pode escrever na disponibilidade nem ler os
--  agendamentos. Logo, o navegador, sozinho, não tem como esconder um horário
--  que outro cliente acabou de pegar — isso PRECISA ser garantido no banco.
--
--  O QUE ESTE SCRIPT FAZ (rode UMA vez no Supabase)
--  Cria um "guardião" que roda a cada novo agendamento e:
--    1. Serializa pedidos simultâneos no mesmo horário (trava a linha do slot),
--       impedindo que duas pessoas reservem o mesmo horário ao mesmo tempo.
--    2. Recusa o agendamento se o horário já atingiu a "capacidade" (sem
--       overbooking). O site mostra "esse horário acabou de ser reservado".
--    3. Quando o horário enche, marca "bloqueada = true" na disponibilidade,
--       então ele some do site para TODO mundo, na hora.
--
--  COMO REABRIR UM HORÁRIO ("desmarcar pelo app")
--  Basta o app voltar a disponibilidade para:
--      UPDATE public.visita_disponibilidade
--         SET bloqueada = false, motivo_bloqueio = NULL
--       WHERE id = '<id-do-slot>';
--  (ou cancelar o agendamento e reabrir o slot pela tela da agenda).
--
--  SEGURANÇA / IMPACTO NO APP
--  - Só mexe em "visita_disponibilidade" e "visita_agendamento".
--  - Inserções para um horário que NÃO existe na disponibilidade passam intactas
--    (não interfere em fluxos do próprio app que não usam a grade de horários).
--  - "SECURITY DEFINER" deixa o gatilho atualizar a disponibilidade mesmo a
--    inserção vindo do papel anon (que não tem UPDATE) — sem afrouxar a RLS.
--
--  COMO RODAR
--  Supabase → SQL Editor → cole tudo → Run. (Idempotente: pode rodar de novo.)
-- =============================================================================

create or replace function public.visita_agendamento_guard()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id    uuid;
  v_cap   integer;
  v_used  integer;
begin
  -- 1) Encontra e TRAVA o slot correspondente (serializa concorrência).
  select id, coalesce(capacidade, 1)
    into v_id, v_cap
    from public.visita_disponibilidade
   where data = NEW.data
     and hora = NEW.hora
   for update;

  -- Sem slot gerenciado para este horário: não interfere (fluxos próprios do app).
  if v_id is null then
    return NEW;
  end if;

  -- 2) Conta quantos agendamentos já existem para este horário.
  select count(*)
    into v_used
    from public.visita_agendamento
   where data = NEW.data
     and hora = NEW.hora;

  -- Já cheio: recusa (impede overbooking).
  if v_used >= v_cap then
    raise exception 'Horário % %h já está reservado.', NEW.data, NEW.hora
      using errcode = 'check_violation';
  end if;

  -- 3) Este agendamento enche o slot? Então some do site até o app reabrir.
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

-- (Opcional, defesa extra para capacidade = 1) Impede duas linhas idênticas
-- de agendamento no mesmo dia/horário no nível do banco. Descomente se quiser:
-- create unique index if not exists ux_visita_agendamento_slot
--   on public.visita_agendamento (data, hora)
--   where coalesce(capacidade_excecao, false) is not true;  -- ajuste conforme seu schema
