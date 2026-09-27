import { NextResponse } from "next/server";
import { EsquemaEvento } from "@/lib/validate";
import { checarLimite, chaveDoChamador } from "@/lib/rate-limit";
import { supabaseService } from "@/lib/supabase/service";
import { hashIp, hashSessao } from "@/lib/anon";

export const runtime = "nodejs";

/*
  Recebimento de eventos de metrica. Regras do plano:
  - consent explícito no payload (sem consent = rejeitado, nunca aceito por padrão)
  - IP e sessão viram hash (SHA-256 + salt diário) antes de gravar
  - sem service_role configurada, segue em modo demo: valida e responde 204
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

  const db = supabaseService();
  if (!db) return new NextResponse(null, { status: 204 }); // modo demo

  const ipHash = hashIp(req.headers.get("x-forwarded-for"));
  const sessaoHash = hashSessao(parse.data.sessao);

  try {
    // consent da sessão: grava uma vez, na primeira aparição
    const { count } = await db
      .from("consent")
      .select("id", { count: "exact", head: true })
      .eq("session_hash", sessaoHash);
    if (!count) {
      await db
        .from("consent")
        .insert({ session_hash: sessaoHash, ip_hash: ipHash, metricas: true, anuncios: false });
    }
    await db
      .from("events")
      .insert({
        nome: parse.data.nome,
        props: parse.data.props,
        session_hash: sessaoHash,
        ip_hash: ipHash,
      });
  } catch {
    // métrica nunca pode derrubar a rota
  }
  return new NextResponse(null, { status: 204 });
}
