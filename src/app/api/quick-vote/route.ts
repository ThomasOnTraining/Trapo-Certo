import { NextResponse } from "next/server";
import { EsquemaVoto } from "@/lib/validate";
import { checarLimite, chaveDoChamador } from "@/lib/rate-limit";
import { supabaseService } from "@/lib/supabase/service";
import { hashSessao } from "@/lib/anon";

export const runtime = "nodejs";

/*
  Voto rapido (recomendo / nao recomendo). Grava em quick_votes com
  hash de sessao (salt diario): o unique (provider_id, voter_session_hash)
  faz o dedup — reenvio da mesma sessão cai no on conflict do nothing.
  Stats sobem pela trigger, nunca por escrita direta.
*/
export async function POST(req: Request) {
  const limite = checarLimite(
    chaveDoChamador(req.headers.get("x-forwarded-for"), "quick-vote"),
    30,
    60
  );
  if (!limite.permitido) {
    return NextResponse.json(
      { erro: "Calma lá!" },
      { status: 429, headers: { "Retry-After": String(limite.restamSegundos) } }
    );
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido" }, { status: 400 });
  }

  const parse = EsquemaVoto.safeParse(corpo);
  if (!parse.success) {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const db = supabaseService();
  if (!db) return NextResponse.json({ ok: true }); // modo demo

  try {
    await db.from("quick_votes").insert({
      provider_id: parse.data.prestadorId,
      voter_session_hash: hashSessao(parse.data.sessao),
      voto: parse.data.voto === "positivo" ? 1 : -1,
    });
  } catch {
    // voto nunca trava a pagina
  }
  return NextResponse.json({ ok: true });
}
