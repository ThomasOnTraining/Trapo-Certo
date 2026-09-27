import { NextResponse } from "next/server";
import { supabaseAutenticado } from "@/lib/supabase/auth";

export const runtime = "nodejs";

/*
  Destino do link magico: troca o code da URL por sessao em cookie e
  manda o morador para o painel.
*/
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const destinoBruto = searchParams.get("destino") ?? "/painel";
  // so caminho local: evita redirect aberto para site externo
  const destino = destinoBruto.startsWith("/") ? destinoBruto : "/painel";

  if (code) {
    const db = await supabaseAutenticado();
    await db?.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(destino, origin));
}
