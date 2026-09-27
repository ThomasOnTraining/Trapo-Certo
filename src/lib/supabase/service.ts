import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
  Cliente service_role: ignora a RLS, por isso SÓ nas rotas de API de
  gravação (métricas, denúncia, voto). A chave fica só no servidor.
  Sem a chave no .env.local, retorna null e a rota segue em modo demo.
*/

export function supabaseService(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
