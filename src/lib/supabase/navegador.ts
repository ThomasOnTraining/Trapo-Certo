import { createBrowserClient } from "@supabase/ssr";

/*
  Cliente do navegador: le a sessao dos cookies nao-httpOnly escritos
  pelo fluxo de auth. Usado em componentes client para gravar com o
  proprio JWT (RLS de dono e o que autoriza). Sem next/headers aqui.
*/
export function supabaseNavegador() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
