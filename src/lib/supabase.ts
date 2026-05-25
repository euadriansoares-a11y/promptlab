import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

// Limpar a URL caso o usuário tenha colado a URL da Data API (com /rest/v1/)
supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}`;
}

let isValidUrl = false;
try {
  if (supabaseUrl) {
    new URL(supabaseUrl);
    isValidUrl = true;
  }
} catch (e) {
  isValidUrl = false;
}

export const supabase = (isValidUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
