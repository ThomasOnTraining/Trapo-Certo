import { NextResponse } from "next/server";
import { EsquemaCliqueContato } from "@/lib/validate";
import { checarLimite, chaveDoChamador } from "@/lib/rate-limit";
import { supabaseService } from "@/lib/supabase/service";
import { hashIp } from "@/lib/anon";

export const runtime = "nodejs";

/*
  Registro de clique de contato (WhatsApp). Sem dado pessoal do
  visitante: apenas qual perfil foi contatado e o ip_hash (salt diário).
  Sem service_role, segue em modo demo (só valida).
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

  const db = supabaseService();
  if (!db) return new NextResponse(null, { status: 204 }); // modo demo

  try {
    await db.from("contact_clicks").insert({
      provider_id: parse.data.prestadorId,
      ip_hash: hashIp(req.headers.get("x-forwarded-for")),
    });
  } catch {
    // métrica nunca pode bloquear o clique
  }
  return new NextResponse(null, { status: 204 });
}
