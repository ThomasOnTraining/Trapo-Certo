import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
  Cliente de leitura para páginas e rotas. Usa a publishable key, então
  respeita a RLS (só vê o que as policies de SELECT liberam).
  Auth com cookies é fase 2 — por enquanto não há sessão de usuário.
*/

let cacheado: SupabaseClient | null = null;

export function supabaseLeitura(): SupabaseClient | null {
  if (cacheado) return cacheado;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null; // modo demonstração
  cacheado = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cacheado;
}
