-- ============================================================
-- TRAMPO CERTO — schema Supabase (Postgres)
-- Principios: UUID em toda PK, RLS em toda tabela, dono so acessa
-- o que e dele (auth.uid()), dado sensivel nunca em coluna solta.
-- ============================================================

create extension if not exists pg_trgm;   -- busca tolerante
create extension if not exists pgcrypto;  -- gen_random_uuid e hash

-- ---------- perfis de acesso ----------
create table profiles (
  id uuid primary key default gen_random_uuid() references auth.users(id) on delete cascade,
  nome text not null,
  email text not null unique,           -- allowlist Gmail/Hotmail validada no app
  criado_em timestamptz not null default now(),
  papel text not null default 'usuario' check (papel in ('usuario','admin'))
);

-- ---------- prestadores ----------
create table providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  tipo text not null check (tipo in ('pessoa','empresa')),
  slug text not null unique,
  nome text not null,
  profissao text not null,
  bio text not null default '',
  bairros text[] not null default '{}',
  disponivel_hoje boolean not null default false,
  whatsapp text not null,               -- publico POR ESCOLHA do prestador
  gmaps_url text,
  maps_query text,
  horario text,
  equipe smallint,
  verificado boolean not null default false,   -- so a moderação muda
  status text not null default 'rascunho' check (status in ('rascunho','publicado','suspenso')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index idx_providers_user on providers(user_id);
create index idx_providers_status on providers(status);
create index idx_providers_busca on providers
  using gin ((nome || ' ' || profissao || ' ' || bio) gin_trgm_ops);

-- verificação de documento: NUNCA no banco, arquivo em bucket privado
create table verifications (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pendente' check (status in ('pendente','aprovado','reprovado')),
  storage_path text not null,           -- caminho no bucket privado, nunca o conteúdo
  criado_em timestamptz not null default now()
);

-- ---------- categorias e serviços ----------
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  icone text not null
);

create table provider_services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  titulo text not null,
  preco_desde numeric(10,2)
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

-- denormalizacao de metrica do perfil (mantida por trigger)
alter table providers add column nota_media numeric(3,2) not null default 0;
alter table providers add column total_avaliacoes integer not null default 0;

create or replace function recalc_nota() returns trigger as $$
begin
  update providers p set
    nota_media = coalesce((select round(avg(nota)::numeric,2) from reviews r where r.provider_id = new.provider_id), 0),
    total_avaliacoes = (select count(*) from reviews r where r.provider_id = new.provider_id)
  where p.id = new.provider_id;
  return new;
end $$ language plpgsql security definer;

create trigger trg_recalc_nota
  after insert or update or delete on reviews
  for each row execute function recalc_nota();

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
  ip_hash text not null,                -- SHA-256 com salt DIARIO rotativo
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

create table metrics_daily (
  dia date not null,
  provider_id uuid references providers(id) on delete cascade,
  paginas_vistas integer not null default 0,
  cliques_contato integer not null default 0,
  buscas integer not null default 0,
  visitantes_unicos integer not null default 0,
  primary key (dia, provider_id)
);
-- agregação diária via pg_cron; bruto apagado após 12 meses

-- ---------- anuncios e sinonimos ----------
create table ads (
  id uuid primary key default gen_random_uuid(),
  anunciante_user_id uuid not null references profiles(id) on delete cascade,
  nome_anunciante text not null,
  descricao text not null,
  whatsapp text not null,
  posicao text not null check (posicao in ('patrocinado_cidade','fim_lista','categoria')),
  categoria_slug text,
  status text not null default 'ativo' check (status in ('ativo','pausado','encerrado')),
  pago_ate date not null,
  criado_em timestamptz not null default now()
);

create table search_synonyms (
  termo text primary key,
  sinonimos text[] not null default '{}',
  origem text not null default 'manual' check (origem in ('manual','demanda'))
);

-- ============================================================
-- RLS: publico le o que e publicado; dono toca so o seu;
-- metricas/denuncias sem leitura para ninguem comum.
-- ============================================================
alter table profiles enable row level security;
create policy "dono le perfil" on profiles for select using (auth.uid() = id);
create policy "dono edita perfil" on profiles for update using (auth.uid() = id);

alter table providers enable row level security;
create policy "publico le publicado" on providers for select
  using (status = 'publicado' or auth.uid() = user_id);
create policy "dono cria" on providers for insert with check (auth.uid() = user_id);
create policy "dono edita" on providers for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- verificado e status so mudam via funcao security definer do admin

alter table verifications enable row level security;
create policy "dono envia" on verifications for insert with check (auth.uid() = user_id);
create policy "dono le status" on verifications for select using (auth.uid() = user_id);

alter table reviews enable row level security;
create policy "publico le avaliacoes" on reviews for select using (true);
create policy "autenticado avalia" on reviews for insert with check (auth.uid() = user_id);
create policy "dono edita avaliacao" on reviews for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table quick_votes enable row level security;
create policy "sem leitura direta" on quick_votes for select using (false);
create policy "anon vota" on quick_votes for insert with check (true);

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
create policy "anon denuncia" on reports for insert with check (true);

alter table consent enable row level security;
create policy "sem leitura consent" on consent for select using (false);
create policy "anon grava consent" on consent for insert with check (true);

alter table events enable row level security;
create policy "sem leitura events" on events for select using (false);
create policy "anon grava events" on events for insert with check (true);

alter table contact_clicks enable row level security;
create policy "sem leitura clicks" on contact_clicks for select using (false);
create policy "anon grava clicks" on contact_clicks for insert with check (true);

alter table metrics_daily enable row level security;
create policy "sem leitura metrics" on metrics_daily for select using (false);
-- painel do anunciante le via funcao security definer (valida dono la dentro)

alter table ads enable row level security;
create policy "publico le anuncio ativo" on ads for select using (status = 'ativo');
create policy "dono le o seu anuncio" on ads for select using (auth.uid() = anunciante_user_id);

alter table search_synonyms enable row level security;
create policy "publico le sinonimos" on search_synonyms for select using (true);

alter table categories enable row level security;
create policy "publico le categorias" on categories for select using (true);

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

-- ---------- buckets ----------
-- 'documentos-verificacao': PRIVADO, sem policy publica; acesso so via
-- signed URL de 5 min gerada no servidor para o admin.
-- 'portfolio': leitura publica, escrita so dono via servidor
-- (mime checado por assinatura, EXIF removido).
insert into storage.buckets (id, name, public) values
  ('documentos-verificacao','documentos-verificacao', false),
  ('portfolio','portfolio', true);
