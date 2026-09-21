import { NextResponse } from "next/server";
import { EsquemaEvento } from "@/lib/validate";
import { checarLimite, chaveDoChamador } from "@/lib/rate-limit";

export const runtime = "nodejs";

/*
  Recebimento de eventos de metrica. Regras do plano:
  - consent explícito no payload (sem consent = rejeitado, nunca aceito por padrão)
  - IP usado só para rate limit em memória; nunca persistido em claro
  - em produção: gravar em `events` com ip_hash (SHA-256 + salt diário)
    e session_hash; aqui, modo demo apenas valida e responde 204.
*/
export async function POST(req: Request) {
  const limite = checarLimite(
    chaveDoChamador(req.headers.get("x-forwarded-for"), "events"),
    120,
    60
  );
  if (!limite.permitido) {
    return NextResponse.json(
      { erro: "Calma lá! Tenta de novo em alguns segundos." },
      { status: 429, headers: { "Retry-After": String(limite.restamSegundos) } }
    );
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido" }, { status: 400 });
  }

  const parse = EsquemaEvento.safeParse(corpo);
  if (!parse.success) {
    return NextResponse.json({ erro: "Evento inválido" }, { status: 400 });
  }

  if (!parse.data.consent) {
    // Sem consentimento: só o agregado de página (servidor), nada aqui.
    return new NextResponse(null, { status: 204 });
  }

  // TODO (produção): INSERT INTO events (..., ip_hash, session_hash)
  return new NextResponse(null, { status: 204 });
}
