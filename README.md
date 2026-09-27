# Trampo Certo

Catálogo de serviços de cidade pequena: pessoas e empresas divulgam seu
trabalho, moradores encontram com busca tolerante e avaliam. Quem busca
**não precisa de conta**; o contato é direto no WhatsApp, fora da plataforma.

## Rodando

```bash
npm install
npm run dev
```

Sem variáveis de ambiente o site roda em **modo demonstração** (dados de
exemplo em `src/lib/demo.ts`). Para conectar o Supabase:

1. Crie um projeto no Supabase e copie `.env.example` para `.env.local`,
   preenchendo URL, anon key e service role key.
2. Rode o conteúdo de `supabase/schema.sql` no SQL Editor do projeto
   (cria tabelas, RLS, triggers e os buckets de storage).
3. (Opcional) Rode `supabase/seed.sql` no SQL Editor para popular Paranaguá
   com dados de demonstração: 10 prestadores, avaliações, votos, 1 anúncio
   e sinônimos de busca. Cria também as contas demo (senha `demo1234`) —
   úteis quando o Auth for ligado na fase 2.
4. No painel de Auth: habilite Google OAuth (e Magic Link), com
   redirecionamento para `/api/auth/callback` (fluxo PKCE, tokens só em
   cookie httpOnly, nunca em URL).

## Arquitetura em vigor

- **Next.js 15 (App Router) + Tailwind v4**, mobile-first; home = catálogo
  direto na primeira dobra, sem hero.
- **Segurança**: sanitização/validação sempre no backend (`src/lib/validate.ts`,
  Zod + normalizadores); UUID em toda PK; RLS de dono em todas as tabelas;
  nada sensível em URL (body/headers apenas); rate limit generoso em memória
  (`src/lib/rate-limit.ts`); CSP e headers no middleware; sem senha em banco
  (login Google/Microsoft passwordless, allowlist Gmail/Hotmail no servidor).
- **Privacidade**: IP e sessão hasheados com salt diário rotativo nas métricas;
  documentos de verificação só em bucket privado com signed URL de 5 min.
- **SEO**: `robots.ts` com indexação seletiva + crawlers de IA permitidos,
  `sitemap.ts` só com páginas que têm conteúdo, JSON-LD (`LocalBusiness` +
  `AggregateRating`) por perfil, e `/llms.txt` para answer engines.
- **Monetização**: patrocinado da cidade, banner de fim de lista e anúncios
  por categoria, sempre etiquetados, máx. 3 por tela, nunca entre o usuário
  e o botão de WhatsApp.
- **Busca**: fuzzy com trigramas + dicionário de sinônimos (`src/lib/search.ts`),
  separa serviço de bairro na mesma frase; em produção, `pg_trgm` + `unaccent`
  no banco (índice já criado no schema).

## Próximos passos (fase 2)

- Supabase Auth conectado (PKCE + allowlist de domínio em `src/lib/validate.ts`).
- Cadastro do prestador em passos curtos, verificação de documento e painel
  do prestador/anunciante com métricas agregadas.
- Admin (moderação de denúncias, aprovação de verificação, sinônimos de
  busca alimentados por buscas sem resultado, gestão de anúncios).
- Alertas de disponibilidade ("avise quando aparecer") e PWA leve.
- Cloudflare na frente (DNS/proxy/WAF, cache só de estáticos, sem Rocket
  Loader).
