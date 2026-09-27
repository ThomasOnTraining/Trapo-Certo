import { NextResponse } from "next/server";
import { normalizarBusca, EsquemaBusca } from "@/lib/validate";
import { checarLimite, chaveDoChamador } from "@/lib/rate-limit";
import { BAIRROS } from "@/lib/demo";
import { listarCategorias, listarPrestadores } from "@/lib/catalogo";
import { expandir, similaridade } from "@/lib/search";

export const runtime = "nodejs";

/** Sugestoes da busca: categorias, bairros e prestadores parecidos. */
export async function GET(req: Request) {
  const limite = checarLimite(
    chaveDoChamador(req.headers.get("x-forwarded-for"), "suggest"),
    60,
    60
  );
  if (!limite.permitido) {
    return NextResponse.json(
      { erro: "Calma lá!" },
      { status: 429, headers: { "Retry-After": String(limite.restamSegundos) } }
    );
  }

  const url = new URL(req.url);
  const parse = EsquemaBusca.safeParse({ q: url.searchParams.get("q") ?? "" });
  if (!parse.success || !parse.data.q || parse.data.q.length < 2) {
    return NextResponse.json([]);
  }

  const q = normalizarBusca(parse.data.q);
  const [categorias, prestadores] = await Promise.all([
    listarCategorias(),
    listarPrestadores(),
  ]);
  const sugestoes: {
    tipo: "categoria" | "bairro" | "prestador";
    texto: string;
    detalhe: string;
    href: string;
  }[] = [];

  for (const c of categorias) {
    const nome = normalizarBusca(c.nome);
    if (nome.includes(q) || similaridade(q, nome) > 0.5) {
      const total = prestadores.filter((p) => p.categoriaSlugs.includes(c.slug)).length;
      if (total > 0) {
        sugestoes.push({
          tipo: "categoria",
          texto: c.nome,
          detalhe: `${total} profissionais`,
          href: `/busca?categoria=${c.slug}`,
        });
      }
    }
  }

  for (const b of BAIRROS) {
    const nome = normalizarBusca(b);
    if (nome.includes(q)) {
      sugestoes.push({
        tipo: "bairro",
        texto: b,
        detalhe: "bairro",
        href: `/busca?q=${encodeURIComponent(b)}`,
      });
    }
  }

  // Expansao por sinonimo: "encanador" sugere Hidraulica, por exemplo
  for (const termo of expandir(q)) {
    const t = normalizarBusca(termo);
    if (t === q) continue;
    for (const c of categorias) {
      const nome = normalizarBusca(c.nome);
      if (nome.includes(t) && !sugestoes.some((s) => s.texto === c.nome)) {
        const total = prestadores.filter((p) => p.categoriaSlugs.includes(c.slug)).length;
        if (total > 0) {
          sugestoes.push({
            tipo: "categoria",
            texto: c.nome,
            detalhe: `também procura por ${c.nome} (${total} profissionais)`,
            href: `/busca?categoria=${c.slug}`,
          });
        }
      }
    }
  }

  for (const p of prestadores) {
    const nome = normalizarBusca(p.nome);
    const prof = normalizarBusca(p.profissao);
    if (
      (nome.includes(q) || prof.includes(q) || similaridade(q, prof) > 0.55) &&
      !sugestoes.some((s) => s.texto === p.nome)
    ) {
      sugestoes.push({
        tipo: "prestador",
        texto: p.nome,
        detalhe: `${p.profissao}, nota ${p.notaMedia.toFixed(1)}`,
        href: `/prestador/${p.slug}`,
      });
    }
  }

  return NextResponse.json(sugestoes.slice(0, 6));
}
