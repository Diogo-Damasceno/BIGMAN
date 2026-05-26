-- ============================================================
-- BIG MAN Barber Shop — Schema SQL para Supabase
-- ============================================================
-- Execute este script no SQL Editor do seu projeto Supabase.
-- Acesse: https://supabase.com → seu projeto → SQL Editor
-- ============================================================


-- ─── Tabela: cortes ──────────────────────────────────────────
-- Armazena os tipos de corte e seus respectivos preços.

CREATE TABLE IF NOT EXISTS cortes (
  id        SERIAL PRIMARY KEY,
  nome      TEXT NOT NULL UNIQUE,
  preco     NUMERIC(10, 2) NOT NULL,
  ativo     BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Dados iniciais: cortes disponíveis ───────────────────────

INSERT INTO cortes (nome, preco) VALUES
  ('Degradê',        35.00),
  ('Social',         25.00),
  ('Americano',      40.00),
  ('Navalhado',      45.00),
  ('Barba',          30.00),
  ('Corte + Barba',  60.00),
  ('Pigmentação',    80.00),
  ('Progressiva',    90.00)
ON CONFLICT (nome) DO NOTHING;


-- ─── Tabela: atendimentos ─────────────────────────────────────
-- Registra cada atendimento finalizado pelo bot.

CREATE TABLE IF NOT EXISTS atendimentos (
  id          SERIAL PRIMARY KEY,
  telefone    TEXT NOT NULL,
  cliente_nome TEXT NOT NULL,
  corte_nome  TEXT NOT NULL,
  corte_preco TEXT NOT NULL,
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);


-- ─── Índices para performance ─────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_atendimentos_telefone   ON atendimentos(telefone);
CREATE INDEX IF NOT EXISTS idx_atendimentos_criado_em  ON atendimentos(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_cortes_nome             ON cortes(nome);


-- ─── Políticas de segurança (Row Level Security) ──────────────
-- Permite leitura pública dos cortes (necessário para o bot anon)

ALTER TABLE cortes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE atendimentos ENABLE ROW LEVEL SECURITY;

-- Leitura dos cortes: anon pode ler (necessário para o bot)
CREATE POLICY "cortes_read_all"
  ON cortes FOR SELECT
  USING (true);

-- Inserção de atendimentos: anon pode inserir
CREATE POLICY "atendimentos_insert_all"
  ON atendimentos FOR INSERT
  WITH CHECK (true);

-- Leitura de atendimentos: somente autenticados
CREATE POLICY "atendimentos_read_auth"
  ON atendimentos FOR SELECT
  USING (auth.role() = 'authenticated');


-- ─── View: Resumo de atendimentos ────────────────────────────
-- Útil para consulta rápida no dashboard do Supabase.

CREATE OR REPLACE VIEW v_resumo_atendimentos AS
SELECT
  to_char(criado_em AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') AS data_hora,
  cliente_nome  AS cliente,
  corte_nome    AS corte,
  corte_preco   AS preco,
  telefone
FROM atendimentos
ORDER BY criado_em DESC;
