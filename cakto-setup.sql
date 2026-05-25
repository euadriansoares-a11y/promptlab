CREATE TABLE IF NOT EXISTS perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  email TEXT,
  telefone TEXT,
  acesso_ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  produto_nome TEXT,
  valor NUMERIC(10,2),
  metodo_pagamento TEXT,
  cakto_order_id TEXT UNIQUE,
  status TEXT DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê seu próprio perfil"
  ON perfis FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuário vê suas próprias compras"
  ON compras FOR SELECT USING (auth.uid() = user_id);
