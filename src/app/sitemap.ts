import type { MetadataRoute } from "next";
import { listarCategorias, listarPrestadores } from "@/lib/catalogo";

const BASE = "https://trampocerto.com.br";

/** Sitemap dinamico: so paginas com conteudo real (regra anti-escala). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hoje = new Date();
  const [categorias, prestadores] = await Promise.all([
    listarCategorias(),
    listarPrestadores(),
  ]);
  const estaticas: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: hoje, priority: 1 },
    { url: `${BASE}/busca`, lastModified: hoje, priority: 0.8 },
    ...categorias
      .filter((c) =>
        prestadores.some((p) => p.categoriaSlugs.includes(c.slug))
      )
      .map((c) => ({
        url: `${BASE}/busca?categoria=${c.slug}`,
        lastModified: hoje,
        priority: 0.7,
      })),
  ];
  const perfis: MetadataRoute.Sitemap = prestadores.map((p) => ({
    url: `${BASE}/prestador/${p.slug}`,
    lastModified: hoje,
    priority: 0.9,
  }));
  return [...estaticas, ...perfis];
}
