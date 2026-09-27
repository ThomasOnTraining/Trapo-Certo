import { NextResponse } from "next/server";
import { EsquemaDenuncia, textoPuro } from "@/lib/validate";
import { checarLimite, chaveDoChamador } from "@/lib/rate-limit";
import { supabaseService } from "@/lib/supabase/service";

export const runtime = "nodejs";

/*
  Denuncia de perfil. Anonima, texto puro sanitizado, rate limit
  apertado (5/hora) porque e rota escrita por anonimo. Sem service_role
  segue em modo demo (só valida).
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

  const db = supabaseService();
  if (!db) return NextResponse.json({ ok: true }); // modo demo

  try {
    await db.from("reports").insert({
      provider_id: denuncia.prestadorId,
      motivo: denuncia.motivo,
      detalhes: denuncia.detalhes,
    });
  } catch {
    // denuncia nunca trava na cara do morador; segue como recebida
  }
  return NextResponse.json({ ok: true });
}
