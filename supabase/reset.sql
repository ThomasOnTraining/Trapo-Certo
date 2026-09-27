-- ============================================================
-- TRAMPO CERTO — reset limpo do banco.
-- Rode no SQL Editor ANTES do schema.sql se o projeto ja tiver
-- versao antiga das tabelas. Nao toca em auth de gente real:
-- remove so as tabelas/funcoes/triggers do app.
-- Depois deste arquivo: schema.sql e, se quiser, seed.sql.
-- ============================================================

-- ---------- tabelas (cascade resolve a ordem das FKs) ----------
drop table if exists metrics_daily cascade;
drop table if exists contact_clicks cascade;
drop table if exists events cascade;
drop table if exists consent cascade;
drop table if exists reports cascade;
drop table if exists hires cascade;
drop table if exists alerts cascade;
drop table if exists favorites cascade;
drop table if exists quick_votes cascade;
drop table if exists reviews cascade;
drop table if exists provider_portfolio cascade;
drop table if exists provider_services cascade;
drop table if exists provider_categories cascade;
drop table if exists categories cascade;
drop table if exists verifications cascade;
drop table if exists providers cascade;
drop table if exists profiles cascade;
drop table if exists ads cascade;
drop table if exists search_synonyms cascade;

-- ---------- funcoes e triggers (versao antiga e nova) ----------
-- o cascade derruba junto o trigger que depende da funcao
-- (ex.: trg_recalc_nota, on_auth_user_created em auth.users).
drop function if exists recalc_nota() cascade;                  -- schema antigo
drop function if exists recalc_provider_stats(uuid) cascade;
drop function if exists trg_recalc_reviews() cascade;
drop function if exists trg_recalc_votes() cascade;
drop function if exists protege_providers() cascade;
drop function if exists protege_profiles() cascade;
drop function if exists handle_new_user() cascade;
drop function if exists handle_user_email_change() cascade;
drop function if exists sem_acento(text) cascade;

-- ---------- buckets de storage ----------
-- (nao precisa: o schema.sql recria com on conflict do nothing.
--  descomente so se quiser zerar tambem os buckets e os arquivos)
-- delete from storage.objects where bucket_id in ('documentos-verificacao','portfolio');
-- delete from storage.buckets where id in ('documentos-verificacao','portfolio');

-- ---------- contas demo (so se voce ja tinha rodado algum seed) ----------
-- delete from auth.users where email like '%@trampocerto.local';
