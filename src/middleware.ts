import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/*
  Refresh de sessao nas rotas privadas apenas (login, painel, auth).
  Pagina publica nao passa por aqui: fica 100% estatica/cacheavel.
*/

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next();

  let resposta = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(lista) {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        resposta = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) =>
          resposta.cookies.set(name, value, options)
        );
      },
    },
  });

  // Nada entre createServerClient e getUser: a chamada e o que aplica o refresh
  await supabase.auth.getUser();
  return resposta;
}

export const config = {
  matcher: ["/entrar/:path*", "/painel/:path*", "/auth/:path*"],
};
