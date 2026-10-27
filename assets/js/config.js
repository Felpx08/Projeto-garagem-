/* ============================================================
   GARAGEM 617 — CONFIGURAÇÃO
   1) Crie um projeto grátis em https://supabase.com
   2) Rode o arquivo supabase/schema.sql no SQL Editor
   3) Cole abaixo a URL e a chave "anon public" do projeto
   Enquanto estiver vazio, o site roda em MODO DEMONSTRAÇÃO
   (dados salvos só no navegador de quem acessa).
   ============================================================ */
window.G617_CONFIG = {
  SUPABASE_URL: "",       // ex.: "https://xxxxx.supabase.co"
  SUPABASE_ANON_KEY: "",  // chave anon public (é segura para ficar no site)

  // Login do modo demonstração (NÃO funciona quando o Supabase está configurado)
  DEMO_ADMIN_EMAIL: "admin@garagem617.demo",
  DEMO_ADMIN_PASSWORD: "admin617",

  // Horários oferecidos para agendamento
  SLOTS: ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00"],
  // Dias da semana sem atendimento (0 = domingo ... 6 = sábado)
  CLOSED_WEEKDAYS: [0]
};
