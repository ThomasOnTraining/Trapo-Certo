import type { MetadataRoute } from "next";

/*
  Indexacao seletiva: publicas indexadas, paineis/conta bloqueados.
  Crawlers de IA permitidos explicitamente (estrategia de answer engines).
*/
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/prestador/", "/busca", "/termos", "/privacidade", "/aviso-legal", "/cookies"],
        disallow: ["/api/", "/entrar", "/painel/", "/admin/"],
      },
      // Answer engines: bem-vindos nas paginas publicas
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: "https://trampocerto.com.br/sitemap.xml",
  };
}
