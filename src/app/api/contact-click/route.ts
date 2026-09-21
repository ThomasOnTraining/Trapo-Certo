import { NextResponse } from "next/server";
import { EsquemaCliqueContato } from "@/lib/validate";
import { checarLimite, chaveDoChamador } from "@/lib/rate-limit";

export const runtime = "nodejs";

/*
  Registro de clique de contato (WhatsApp). Sem dado pessoal do
  visitante: apenas qual perfil foi contatado. Alimenta o painel do
  prestador. IP só para rate limit, em memória.
*/
export async function POST(req: Request) {
  const limite = checarLimite(
    chaveDoChamador(req.headers.get("x-forwarded-for"), "contact-click"),
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

  const parse = EsquemaCliqueContato.safeParse(corpo);
  if (!parse.success) {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  // TODO (produção): INSERT INTO contact_clicks (provider_id, created_at)
  return new NextResponse(null, { status: 204 });
}
