import { NextResponse } from "next/server";
import { EsquemaDenuncia, textoPuro } from "@/lib/validate";
import { checarLimite, chaveDoChamador } from "@/lib/rate-limit";

export const runtime = "nodejs";

/*
  Denuncia de perfil. Anonima, texto puro sanitizado, rate limit
  apertado (5/hora) porque e rota escrita por anonimo.
*/
export async function POST(req: Request) {
  const limite = checarLimite(
    chaveDoChamador(req.headers.get("x-forwarded-for"), "reports"),
    5,
    60 * 60
  );
  if (!limite.permitido) {
    return NextResponse.json(
      { erro: "Muitas denúncias seguidas. Volte mais tarde." },
      { status: 429, headers: { "Retry-After": String(limite.restamSegundos) } }
    );
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido" }, { status: 400 });
  }

  const parse = EsquemaDenuncia.safeParse(corpo);
  if (!parse.success) {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const denuncia = {
    prestadorId: parse.data.prestadorId,
    motivo: parse.data.motivo,
    detalhes: parse.data.detalhes
      ? textoPuro(parse.data.detalhes, 1000)
      : null,
  };

  // TODO (produção): INSERT INTO reports (...) e notificar admin
  return NextResponse.json({ ok: true });
}
