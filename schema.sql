-- ============================================================
-- PromptLab — Schema Unificado
-- Execute este arquivo no SQL Editor do Supabase.
-- Substitui: cakto-setup.sql, supabase-setup.sql, setup-profiles.sql
-- ============================================================

-- ----------------------------------------------------------------
-- 1. TABELA: profiles
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome                TEXT,
  email               TEXT,
  telefone            TEXT,
  avatar_url          TEXT,
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  acesso_ativo        BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_service" ON public.profiles;
CREATE POLICY "profiles_insert_service"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- ----------------------------------------------------------------
-- 2. TABELA: compras
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.compras (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  produto_nome    TEXT,
  produto_id      TEXT,
  valor           NUMERIC(10,2),
  forma_pagamento TEXT,
  cakto_order_id  TEXT UNIQUE,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "compras_select_own" ON public.compras;
CREATE POLICY "compras_select_own"
  ON public.compras FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "compras_insert_service" ON public.compras;
CREATE POLICY "compras_insert_service"
  ON public.compras FOR INSERT
  WITH CHECK (true);

-- ----------------------------------------------------------------
-- 3. TABELA: prompts
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prompts (
  id           BIGSERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT,
  category     TEXT,
  prompt_text  TEXT,
  username     TEXT,
  avatar       TEXT,
  post_title   TEXT,
  post_subtitle TEXT,
  gradient     TEXT,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prompts_select_authenticated" ON public.prompts;
CREATE POLICY "prompts_select_authenticated"
  ON public.prompts FOR SELECT
  TO authenticated
  USING (true);

-- ----------------------------------------------------------------
-- 4. TRIGGER: atualiza atualizado_em automaticamente
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ----------------------------------------------------------------
-- 5. STORAGE: bucket de avatares
-- ----------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_user_upload" ON storage.objects;
CREATE POLICY "avatars_user_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "avatars_user_update" ON storage.objects;
CREATE POLICY "avatars_user_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "avatars_user_delete" ON storage.objects;
CREATE POLICY "avatars_user_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
