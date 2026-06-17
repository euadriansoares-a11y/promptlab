import { createClient } from '@supabase/supabase-js';

let url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
  .replace(/\/rest\/v1\/?$/, '')
  .replace(/\/$/, '');

if (url && !url.startsWith('http')) {
  url = `https://${url}`;
}

const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

if (!url || !anonKey) {
  throw new Error(
    'Variáveis de ambiente não configuradas: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias.'
  );
}

export const supabase = createClient(url, anonKey);
