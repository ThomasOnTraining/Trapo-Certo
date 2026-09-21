import type { MetadataRoute } from "next";
import { CATEGORIAS, PRESTADORES } from "@/lib/demo";

const BASE = "https://trampocerto.com.br";

/** Sitemap dinamico: so paginas com conteudo real (regra anti-escala). */
export default function sitemap(): MetadataRoute.Sitemap {
  const hoje = new Date();
  const estaticas: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: hoje, priority: 1 },
    { url: `${BASE}/busca`, lastModified: hoje, priority: 0.8 },
    ...CATEGORIAS.filter((c) =>
      PRESTADORES.some((p) => p.categoriaSlugs.includes(c.slug))
    ).map((c) => ({
      url: `${BASE}/busca?categoria=${c.slug}`,
      lastModified: hoje,
      priority: 0.7,
    })),
  ];
  const perfis: MetadataRoute.Sitemap = PRESTADORES.map((p) => ({
    url: `${BASE}/prestador/${p.slug}`,
    lastModified: hoje,
    priority: 0.9,
  }));
  return [...estaticas, ...perfis];
}
