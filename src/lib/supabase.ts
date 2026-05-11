import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Log visible dans la console du navigateur pour diagnostic
console.info('[STELLA] Supabase URL =', supabaseUrl ?? '⚠️ MANQUANTE');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[STELLA] Variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquantes — vérifie Vercel → Settings → Environment Variables puis redéploie.');
}

export const supabase = createClient(
  supabaseUrl     ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder',
);
