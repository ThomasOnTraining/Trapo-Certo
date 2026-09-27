-- ============================================================
-- TRAMPO CERTO — schema Supabase (Postgres)
-- Principios: UUID em toda PK, RLS em toda tabela, dono so acessa
-- o que e dele (auth.uid()), dado sensivel nunca em coluna solta.
--
-- Roles: "anon"/"authenticated" = visitante/usuario via PostgREST
-- (chave publica, RLS aplica). "service_role" = rotas Next.js
-- (bypassa RLS, nunca exposta ao browser). SQL editor = postgres
-- nativo (auth.role() e null, sem JWT).
-- ============================================================

create extension if not exists pg_trgm;   -- busca tolerante
create extension if not exists pgcrypto;  -- gen_random_uuid e crypt
create extension if not exists unaccent;  -- busca sem acento (PT-BR)

-- unaccent(text) e STABLE, e indice so aceita funcao IMMUTABLE.
-- Wrapper e o padrao aceito: o dicionario unaccent e fixo neste
-- projeto. Toda consulta de busca tem que usar sem_acento() com a
-- MESMA expressao do indice abaixo.
create or replace function sem_acento(t text) returns text
language sql immutable set search_path = public as $$
  select public.unaccent(t);
$$;

-- ============================================================
-- TABELAS
-- ============================================================

-- ---------- perfis de acesso ----------
-- id SEM default: tem que vir de auth.users (trigger cria o perfil).
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null unique,           -- allowlist Gmail/Hotmail validada no app
  criado_em timestamptz not null default now(),
  papel text not null default 'usuario' check (papel in ('usuario','admin'))
);

-- ---------- prestadores ----------
-- user_id sem unique de proposito: uma conta pode ter mais de um
-- perfil (pessoa + empresa). O perfil PUBLICA na hora (status nasce
-- 'publicado'): a moderacao nao e fila de aprovacao. O que a equipe
-- faz depois e VERIFICAR (documento conferido) — 'verificado' nasce
-- false e so a moderacao muda (trigger). 'suspenso' tira do catalogo.
create table providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  tipo text not null check (tipo in ('pessoa','empresa')),
  slug text not null unique,
  nome text not null,
  profissao text not null,
  bio text not null default '',
  cidade_slug text not null default 'paranagua',  -- o produto e por cidade
  bairros text[] not null default '{}',
  disponivel_hoje boolean not null default false, -- resetado de madrugada (cron abaixo)
  whatsapp text not null check (whatsapp ~ '^[0-9]{10,15}$'),
  gmaps_url text,
  maps_query text,
  site text,
  horario text,
  equipe smallint check (equipe is null or equipe >= 1),
  anos_regiao smallint not null default 0,
  verificado boolean not null default false,   -- so a moderacao muda (trigger)
  status text not null default 'publicado' check (status in ('publicado','suspenso')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index idx_providers_listagem on providers (cidade_slug, status);
create index idx_providers_user on providers(user_id);

-- busca tolerante sem acento; a consulta precisa usar a MESMA
-- expressao sem_acento(nome)||' '||sem_acento(profissao)||' '||sem_acento(bio)
create index idx_providers_busca on providers
  using gin ((sem_acento(nome) || ' ' || sem_acento(profissao) || ' ' || sem_acento(bio)) gin_trgm_ops);

-- verificacao de documento: NUNCA no banco, arquivo em bucket privado
create table verifications (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pendente' check (status in ('pendente','aprovado','reprovado')),
  storage_path text not null,           -- caminho no bucket privado, nunca o conteudo
  criado_em timestamptz not null default now()
);
-- um pedido pendente por prestador; novo envio so depois de decidido
create unique index idx_verifications_pendente on verifications(provider_id)
  where status = 'pendente';

-- ---------- categorias e servicos ----------
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  icone text not null
);

-- ligacao prestador <-> categoria (faltava no schema antigo)
create table provider_categories (
  provider_id uuid not null references providers(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (provider_id, category_id)
);

create table provider_services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  titulo text not null,
  preco_desde numeric(10,2) check (preco_desde is null or preco_desde >= 0),
  ordem smallint not null default 0      -- ordem de exibicao na ficha
);

create table provider_portfolio (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  storage_path text not null,
  legenda text,
  criado_em timestamptz not null default now()
);

-- ---------- avaliacoes e votos ----------
create table reviews (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  nota smallint not null check (nota between 1 and 5),
  texto text not null,                  -- sanitizado no backend antes do insert
  autor_nome text not null default '',  -- denormalizado p/ exibir sem abrir profiles
  criado_em timestamptz not null default now(),
  unique (provider_id, user_id)
);
create index idx_reviews_provider on reviews(provider_id);

create table quick_votes (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  voter_session_hash text not null,     -- hash irreversivel, nunca ip/identidade
  voto smallint not null check (voto in (1,-1)),
  criado_em timestamptz not null default now(),
  unique (provider_id, voter_session_hash)
);

-- denormalizacao de metrica do perfil (mantida por trigger).
-- E o que a UI le: sem isso, votos ficam ilegiveis pela RLS (select false).
alter table providers add column nota_media numeric(3,2) not null default 0;
alter table providers add column total_avaliacoes integer not null default 0;
alter table providers add column votos_positivos integer not null default 0;
alter table providers add column votos_negativos integer not null default 0;

-- ---------- dados funcionais do usuario (dono le e escreve so o dele) ----------
create table favorites (
  user_id uuid not null references profiles(id) on delete cascade,
  provider_id uuid not null references providers(id) on delete cascade,
  criado_em timestamptz not null default now(),
  primary key (user_id, provider_id)
);

create table alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  cidade_slug text not null default 'paranagua',
  categoria text,
  bairro text,
  termo text,
  status text not null default 'ativo' check (status in ('ativo','pausado')),
  criado_em timestamptz not null default now()
);

create table hires (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  provider_id uuid not null references providers(id) on delete cascade,
  contratou boolean not null default true,
  criado_em timestamptz not null default now()
);

-- ---------- moderacao ----------
create table reports (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  motivo text not null,
  detalhes text,                        -- texto puro sanitizado no backend
  status text not null default 'aberta' check (status in ('aberta','resolvida','descartada')),
  criado_em timestamptz not null default now()
);

-- ---------- metricas (dado anonimo por construcao) ----------
create table consent (
  id uuid primary key default gen_random_uuid(),
  session_hash text not null,           -- hash irreversivel
  ip_hash text not null,                -- SHA-256 com salt DIARIO rotativo (no app)
  metricas boolean not null,
  anuncios boolean not null,
  criado_em timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  props jsonb not null default '{}',
  session_hash text not null,
  ip_hash text not null,
  criado_em timestamptz not null default now()
);
create index idx_events_nome on events(nome, criado_em);

create table contact_clicks (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  ip_hash text not null,                -- para dedup no agregado
  criado_em timestamptz not null default now()
);
create index idx_clicks_provider on contact_clicks(provider_id, criado_em);

-- agregado por prestador (provider_id na PK = implicitamente not null).
-- Totais da cidade sao sum() por cima; bruto apagado apos 12 meses.
create table metrics_daily (
  dia date not null,
  provider_id uuid not null references providers(id) on delete cascade,
  paginas_vistas integer not null default 0,
  cliques_contato integer not null default 0,
  buscas integer not null default 0,
  visitantes_unicos integer not null default 0,
  primary key (dia, provider_id)
);

-- ---------- anuncios e sinonimos ----------
create table ads (
  id uuid primary key default gen_random_uuid(),
  anunciante_user_id uuid not null references profiles(id) on delete cascade,
  cidade_slug text not null default 'paranagua',
  nome_anunciante text not null,
  descricao text not null,
  whatsapp text not null check (whatsapp ~ '^[0-9]{10,15}$'),
  posicao text not null check (posicao in ('patrocinado_cidade','fim_lista','categoria')),
  categoria_slug text,
  status text not null default 'ativo' check (status in ('ativo','pausado','encerrado')),
  pago_ate date not null,
  criado_em timestamptz not null default now()
);
create index idx_ads_posicao on ads(cidade_slug, posicao, categoria_slug);

create table search_synonyms (
  termo text primary key,
  sinonimos text[] not null default '{}',
  origem text not null default 'manual' check (origem in ('manual','demanda'))
);

-- ============================================================
-- FUNCOES E TRIGGERS
-- ============================================================

-- ---------- stats do prestador (nota, avaliacoes, votos) ----------
-- security definer: roda como dono da funcao, senao a RLS de providers
-- bloquearia o recalculo quando um morador insere avaliacao.
create or replace function recalc_provider_stats(p_id uuid) returns void
language sql security definer set search_path = public as $$
  update providers set
    nota_media = coalesce((select round(avg(nota)::numeric,2) from reviews where provider_id = p_id), 0),
    total_avaliacoes = (select count(*) from reviews where provider_id = p_id),
    votos_positivos = (select count(*) from quick_votes where provider_id = p_id and voto = 1),
    votos_negativos = (select count(*) from quick_votes where provider_id = p_id and voto = -1)
  where id = p_id;
$$;

create or replace function trg_recalc_reviews() returns trigger as $$
begin
  perform recalc_provider_stats(coalesce(new.provider_id, old.provider_id));
  return coalesce(new, old);
end $$ language plpgsql;

create trigger trg_recalc_reviews
  after insert or update or delete on reviews
  for each row execute function trg_recalc_reviews();

create or replace function trg_recalc_votes() returns trigger as $$
begin
  perform recalc_provider_stats(coalesce(new.provider_id, old.provider_id));
  return coalesce(new, old);
end $$ language plpgsql;

create trigger trg_recalc_votes
  after insert or update or delete on quick_votes
  for each row execute function trg_recalc_votes();

-- funcao interna dos triggers; nao expor via RPC
revoke execute on function recalc_provider_stats(uuid) from anon, authenticated;

-- ---------- congelamento de colunas de moderacao ----------
-- Quem escreve via PostgREST (anon/authenticated) NAO pode:
--  - virar verificado, mudar status (publicar suspenso de volta);
--  - transferir dono (user_id) ou mudar cidade/criacao.
-- Stats (nota/votos) NAO sao congeladas aqui de proposito: a trigger de
-- recalculo roda como security definer no MESMO contexto JWT e o
-- congelamento anularia a propria atualizacao. Quem pode escrever nas
-- stats e controlado por GRANT de coluna (secao RLS) + trigger de recalc.
-- INSERT via API: nasce PUBLICADO (sem fila de aprovacao), sem
-- verificacao, stats zerados (sem esse ramo, old.* e NULL no INSERT e o
-- congelamento quebraria o insert; alem de fechar o privesc de se
-- auto-verificar). A publicacao imediata e o que o produto promete:
-- perfil no ar na hora, selo de verificado depois.
-- Quem escreve via SQL editor (sem JWT) ou service_role (rotas) passa.
create or replace function protege_providers() returns trigger as $$
begin
  if tg_op = 'INSERT' then
    if auth.role() in ('anon', 'authenticated') then
      new.user_id := auth.uid();
      new.verificado := false;
      new.status := 'publicado';
      new.cidade_slug := 'paranagua';
      new.nota_media := 0;
      new.total_avaliacoes := 0;
      new.votos_positivos := 0;
      new.votos_negativos := 0;
      new.criado_em := now();
    end if;
  else
    if auth.role() in ('anon', 'authenticated') then
      new.verificado := old.verificado;
      new.status := old.status;
      new.user_id := old.user_id;
      new.cidade_slug := old.cidade_slug;
      new.criado_em := old.criado_em;
    end if;
  end if;
  new.atualizado_em := now();
  return new;
end $$ language plpgsql set search_path = public;

create trigger trg_protege_providers
  before insert or update on providers
  for each row execute function protege_providers();

-- ---------- perfil: papel/email/id imutaveis pelo dono ----------
-- Sem isso, UPDATE profiles SET papel='admin' onde id = mim mesmo
-- era permitido pela RLS (dono edita o proprio perfil). Privesc fechado:
-- papel so muda via service_role (rota admin), email acompanha o auth.users.
create or replace function protege_profiles() returns trigger as $$
begin
  if auth.role() in ('anon', 'authenticated') then
    new.id := old.id;
    new.papel := old.papel;
    new.email := old.email;
  end if;
  return new;
end $$ language plpgsql set search_path = public;

create trigger trg_protege_profiles
  before update on profiles
  for each row execute function protege_profiles();

-- ---------- perfil nasce junto com o cadastro ----------
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end $$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- email do perfil acompanha a troca no auth
create or replace function handle_user_email_change() returns trigger as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end $$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();

-- ---------- disponivel_hoje volta a false de madrugada ----------
-- Requer pg_cron habilitado (Database > Extensions no painel Supabase):
-- select cron.schedule('reseta-disponivel-hoje', '30 0 * * *',
--   $$update public.providers set disponivel_hoje = false$$);

-- ============================================================
-- RLS
-- Resumo das contas:
--  - profiles: dono le e edita so o seu; papel/email/id congelados.
--  - providers: publico le o publicado da cidade; dono cria/edita so o
--    seu; UPDATE so nas colunas permitidas (grant de coluna); moderacao,
--    dono, cidade e criacao congelados por trigger; stats so via trigger.
--  - verifications: dono envia e le so da sua conta (e do seu prestador).
--  - favorites/alerts/hires: so o dono, so o seu.
--  - reviews: publico le; usuario autenticado avalia 1x por prestador,
--    nunca no proprio prestador.
--  - quick_votes/reports/consent/events/contact_clicks: SEM leitura e
--    SEM insert anon — escrita so pelas rotas Next (service_role), que
--    tem rate limit. A anon key e publica: insert anon era um endpoint
--    aberto bypassando o rate limit do backend.
--  - metrics_daily: sem leitura direta; painel do anunciante le via
--    funcao security definer (fase 2).
--  - ads: publico le so o ativo E pago; gestao so via service_role.
-- ============================================================

alter table profiles enable row level security;
create policy "dono le perfil" on profiles for select using (auth.uid() = id);
create policy "dono edita perfil" on profiles for update using (auth.uid() = id);

alter table providers enable row level security;
create policy "publico le publicado da cidade" on providers for select
  using (status = 'publicado' or auth.uid() = user_id);
create policy "dono cria" on providers for insert with check (auth.uid() = user_id);
create policy "dono edita" on providers for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- UPDATE so nas colunas do dono: id/user_id/cidade/moderacao/stats/
-- criacao ficam DE FORA do grant (tentativa falha fechada com
-- "permission denied", nao vale silencioso). Stats sobem so pela
-- trigger de recalc (security definer, dono da funcao, nao precisa
-- do grant). INSERT continua em tabela inteira: protege_providers
-- zera o resto no nascer do registro. service_role mantem grant total.
revoke update on providers from anon, authenticated;
grant update (tipo, slug, nome, profissao, bio, bairros, disponivel_hoje,
  whatsapp, gmaps_url, maps_query, site, horario, equipe, anos_regiao)
  on providers to authenticated;

alter table verifications enable row level security;
create policy "dono envia do seu prestador" on verifications for insert with check (
  auth.uid() = user_id
  and auth.uid() = (select user_id from providers p where p.id = provider_id)
);
create policy "dono le status" on verifications for select using (auth.uid() = user_id);

alter table categories enable row level security;
create policy "publico le categorias" on categories for select using (true);

alter table provider_categories enable row level security;
create policy "publico le ligacoes" on provider_categories for select using (true);
create policy "dono liga categoria" on provider_categories for insert with check (
  auth.uid() = (select user_id from providers p where p.id = provider_id)
);
create policy "dono desliga categoria" on provider_categories for delete using (
  auth.uid() = (select user_id from providers p where p.id = provider_id)
);

alter table provider_services enable row level security;
create policy "publico le servicos" on provider_services for select using (true);
create policy "dono cria servico" on provider_services for insert with check (
  auth.uid() = (select user_id from providers p where p.id = provider_id)
);
create policy "dono edita servico" on provider_services for update using (
  auth.uid() = (select user_id from providers p where p.id = provider_id)
);
create policy "dono apaga servico" on provider_services for delete using (
  auth.uid() = (select user_id from providers p where p.id = provider_id)
);

alter table provider_portfolio enable row level security;
create policy "publico le portfolio" on provider_portfolio for select using (true);
create policy "dono gerencia portfolio" on provider_portfolio for all using (
  auth.uid() = (select user_id from providers p where p.id = provider_id)
) with check (
  auth.uid() = (select user_id from providers p where p.id = provider_id)
);

alter table reviews enable row level security;
create policy "publico le avaliacoes" on reviews for select using (true);
create policy "autenticado avalia" on reviews for insert with check (
  auth.uid() = user_id
  and auth.uid() <> (select user_id from providers p where p.id = provider_id)
);
create policy "dono edita avaliacao" on reviews for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table quick_votes enable row level security;
create policy "sem leitura direta" on quick_votes for select using (false);
-- insert apenas via rota /api (service_role); anon removido de proposito

alter table favorites enable row level security;
create policy "dono total favoritos" on favorites for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table alerts enable row level security;
create policy "dono total alertas" on alerts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table hires enable row level security;
create policy "dono total hires" on hires for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table reports enable row level security;
create policy "sem leitura" on reports for select using (false);
-- insert apenas via rota /api (service_role); anon removido de proposito

alter table consent enable row level security;
create policy "sem leitura consent" on consent for select using (false);
-- insert apenas via rota /api (service_role); anon removido de proposito

alter table events enable row level security;
create policy "sem leitura events" on events for select using (false);
-- insert apenas via rota /api (service_role); anon removido de proposito

alter table contact_clicks enable row level security;
create policy "sem leitura clicks" on contact_clicks for select using (false);
-- insert apenas via rota /api (service_role); anon removido de proposito

alter table metrics_daily enable row level security;
create policy "sem leitura metrics" on metrics_daily for select using (false);

alter table ads enable row level security;
-- ativo E dentro do prazo pago: anuncio vencido some sozinho
create policy "publico le anuncio ativo" on ads for select
  using (status = 'ativo' and pago_ate >= current_date);
create policy "dono le o seu anuncio" on ads for select
  using (auth.uid() = anunciante_user_id);
-- insert/update so via service_role (anuncio e pago/gesto pela casa)

alter table search_synonyms enable row level security;
create policy "publico le sinonimos" on search_synonyms for select using (true);

-- ============================================================
-- STORAGE
-- Sem policies de escrita de proposito: upload so via rotas Next
-- (service_role), com checagem de mime por assinatura e EXIF removido.
-- 'documentos-verificacao': PRIVADO; acesso so via signed URL de 5 min
-- gerada no servidor para a moderacao.
-- 'portfolio': leitura publica (bucket publico), escrita so no servidor.
-- ============================================================
insert into storage.buckets (id, name, public) values
  ('documentos-verificacao','documentos-verificacao', false),
  ('portfolio','portfolio', true)
on conflict (id) do nothing;
