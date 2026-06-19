/* =============================================================================
 *  BLUE SENIOR LIVING — Agenda (Supabase do APP)
 *  Configuração tipo "variável de ambiente" do cliente Supabase usado SOMENTE
 *  pela agenda de visitas. Centralizado aqui para não ficar espalhado no código.
 * -----------------------------------------------------------------------------
 *  A ANON KEY é PÚBLICA por natureza (feita para rodar no navegador) e o acesso
 *  é restrito pela RLS do app: só leitura em "visita_disponibilidade" e inserção
 *  em "visita_agendamento".
 *
 *  Em um deploy com build (Vite/Render env), injete estes valores via:
 *      VITE_AGENDA_SUPABASE_URL       ->  url
 *      VITE_AGENDA_SUPABASE_ANON_KEY  ->  anonKey
 *  (definindo window.AGENDA_SUPABASE antes deste arquivo, ele respeita o valor
 *   injetado por causa do "window.AGENDA_SUPABASE || { ... }").
 * ============================================================================= */
window.AGENDA_SUPABASE = window.AGENDA_SUPABASE || {
  url: "https://hqfrxdwumyyujewjgxgc.supabase.co",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZnJ4ZHd1bXl5dWpld2pneGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NzE3NDQsImV4cCI6MjA5NjQ0Nzc0NH0.oAPBEdyyKrruNqhMy_wZgCwtb7QjeksoBAvUDjE7pRQ",
};
