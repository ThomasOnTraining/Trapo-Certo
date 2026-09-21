import { NextResponse, type NextRequest } from "next/server";

/*
  Middleware de seguranca (OWASP baseline):
  - headers de seguranca em todas as respostas
  - CSP que permite apenas o que usamos (Google Maps embed, fonts Google)
  - rotas de API nunca cacheadas (Cache-Control private, no-store)
  Nota: rate limit fica nas rotas (memoria volatel); em produção multi
  instancia, migrar para a borda Cloudflare.
*/

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const csp = [
    "default-src 'self'",
    // Next.js injeta scripts inline de hydratacao; em producao trocar por nonces
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://*.supabase.co https://maps.gstatic.com https://maps.googleapis.com",
    "frame-src https://maps.google.com",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  if (req.nextUrl.pathname.startsWith("/api/")) {
    res.headers.set("Cache-Control", "private, no-store");
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
