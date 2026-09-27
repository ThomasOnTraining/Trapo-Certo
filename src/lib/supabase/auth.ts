import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/*
  Sessao de morador/prestador (fase 2). Este modulo e so de SERVIDOR.
  O client do navegador mora em navegador.ts — importar next/headers
  pelo caminho de um componente client quebra o build. Mesmas envs
  publicas de sempre: sem Supabase configurado, auth nao existe.
*/

function envs() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

/** Cliente autenticado para Server Components, Actions e Route Handlers. */
export async function supabaseAutenticado() {
  const e = envs();
  if (!e) return null;
  const cookieStore = await cookies();
  return createServerClient(e.url, e.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(lista) {
        try {
          lista.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component nao pode escrever cookie; quem refresha e o middleware
        }
      },
    },
  });
}
