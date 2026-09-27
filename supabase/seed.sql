-- ============================================================
-- TRAMPO CERTO — seed de demonstracao (Paranagua)
-- Rode DEPOIS do schema.sql, no SQL Editor. Roda como postgres
-- (sem JWT), entao os triggers de congelamento nao aplicam.
--
-- Idempotente: pode rodar de novo. Servicos, avaliacoes, votos e
-- anuncio demo sao apagados e refeitos; categorias/sinonimos fazem
-- upsert; prestadores/auth.users fazem skip se ja existem.
--
-- Contas criadas (senha unica de demo: demo1234):
--   demo@trampocerto.local        dona dos 10 prestadores
--   anunciante@trampocerto.local  dona do anuncio patrocinado
--   vizinho01..10@                avaliam na demo
-- Login so faz sentido quando o Auth estiver ligado (fase 2); o
-- seed serve para a UI publica ja ter dados reais do banco.
-- ============================================================

-- ---------- contas demo em auth (o trigger cria os profiles) ----------
do $$
begin
  insert into auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  select id, 'authenticated', 'authenticated', email,
         crypt('demo1234', gen_salt('bf')), now(),
         '{"provider":"email","providers":["email"]}'::jsonb,
         jsonb_build_object('nome', nome),
         now(), now()
  from (values
    ('10000000-0000-4000-8000-000000000001'::uuid, 'demo@trampocerto.local', 'Conta Demo'),
    ('10000000-0000-4000-8000-000000000002'::uuid, 'anunciante@trampocerto.local', 'Padaria Central'),
    ('10000000-0000-4000-8000-000000000101'::uuid, 'vizinho01@trampocerto.local', 'Marta G.'),
    ('10000000-0000-4000-8000-000000000102'::uuid, 'vizinho02@trampocerto.local', 'Celio P.'),
    ('10000000-0000-4000-8000-000000000103'::uuid, 'vizinho03@trampocerto.local', 'Dona Neusa'),
    ('10000000-0000-4000-8000-000000000104'::uuid, 'vizinho04@trampocerto.local', 'Seu Jorge'),
    ('10000000-0000-4000-8000-000000000105'::uuid, 'vizinho05@trampocerto.local', 'Patricia L.'),
    ('10000000-0000-4000-8000-000000000106'::uuid, 'vizinho06@trampocerto.local', 'Rodnei A.'),
    ('10000000-0000-4000-8000-000000000107'::uuid, 'vizinho07@trampocerto.local', 'Fernanda R.'),
    ('10000000-0000-4000-8000-000000000108'::uuid, 'vizinho08@trampocerto.local', 'Tiao do Mercado'),
    ('10000000-0000-4000-8000-000000000109'::uuid, 'vizinho09@trampocerto.local', 'Carla M.'),
    ('10000000-0000-4000-8000-000000000110'::uuid, 'vizinho10@trampocerto.local', 'Ivanildo S.')
  ) as t(id, email, nome)
  on conflict do nothing;

  insert into auth.identities (user_id, identity_data, provider, provider_id)
  select id, jsonb_build_object('sub', id::text, 'email', email), 'email', email
  from (values
    ('10000000-0000-4000-8000-000000000001'::uuid, 'demo@trampocerto.local'),
    ('10000000-0000-4000-8000-000000000002'::uuid, 'anunciante@trampocerto.local'),
    ('10000000-0000-4000-8000-000000000101'::uuid, 'vizinho01@trampocerto.local'),
    ('10000000-0000-4000-8000-000000000102'::uuid, 'vizinho02@trampocerto.local'),
    ('10000000-0000-4000-8000-000000000103'::uuid, 'vizinho03@trampocerto.local'),
    ('10000000-0000-4000-8000-000000000104'::uuid, 'vizinho04@trampocerto.local'),
    ('10000000-0000-4000-8000-000000000105'::uuid, 'vizinho05@trampocerto.local'),
    ('10000000-0000-4000-8000-000000000106'::uuid, 'vizinho06@trampocerto.local'),
    ('10000000-0000-4000-8000-000000000107'::uuid, 'vizinho07@trampocerto.local'),
    ('10000000-0000-4000-8000-000000000108'::uuid, 'vizinho08@trampocerto.local'),
    ('10000000-0000-4000-8000-000000000109'::uuid, 'vizinho09@trampocerto.local'),
    ('10000000-0000-4000-8000-000000000110'::uuid, 'vizinho10@trampocerto.local')
  ) as t(id, email)
  on conflict do nothing;
end $$;

-- ---------- categorias (upsert) ----------
insert into categories (slug, nome, icone) values
  ('eletrica','Elétrica','bolt'),
  ('hidraulica','Hidráulica','gota'),
  ('reforma','Reforma e Construção','colher'),
  ('reparos','Pequenos Reparos','chave'),
  ('limpeza','Limpeza','vassoura'),
  ('beleza','Beleza e Estética','tesoura'),
  ('fretes','Mudanças e Fretes','caminhao'),
  ('mecanica','Mecânica','chave-roda'),
  ('tecnologia','Tecnologia','tela'),
  ('aulas','Aulas','lapis')
on conflict (slug) do nothing;

-- ---------- prestadores (mesmos slugs/ids do modo demo src/lib/demo.ts) ----------
-- usuario demo dona de todos; na vida real user_id vem do cadastro.
insert into providers (
  id, user_id, tipo, slug, nome, profissao, bio, cidade_slug, bairros,
  disponivel_hoje, whatsapp, gmaps_url, maps_query, horario, equipe,
  anos_regiao, verificado, status
) values
  ('5f0b3c1e-2a4d-4f8b-9c1d-1a2b3c4d5e01', '10000000-0000-4000-8000-000000000001',
   'pessoa', 'joao-eletrica', 'João Elétrica', 'Eletricista',
   'Instalação e manutenção elétrica residencial. Atendimento no mesmo dia para urgências: disjuntor caindo, tomada, chuveiro e iluminação.',
   'paranagua', '{Centro,"Jardim Aurora"}', true, '5541999990001',
   'https://maps.google.com/?q=eletricista+centro+paranagua', null, null, null, 8, true, 'publicado'),
  ('5f0b3c1e-2a4d-4f8b-9c1d-1a2b3c4d5e02', '10000000-0000-4000-8000-000000000001',
   'empresa', 'eletrica-morada-nova', 'Elétrica Morada Nova', 'Instalações elétricas e segurança',
   'Empresa com equipe de 3 técnicos verificados. Projetos elétricos, cerca elétrica e câmeras para casas e comércios.',
   'paranagua', '{Centro,"Vila Rica","São Pedro"}', false, '5541999990002',
   null, 'Elétrica Morada Nova Paranaguá PR', 'Seg a Sáb, 8h às 18h', 3, 12, true, 'publicado'),
  ('5f0b3c1e-2a4d-4f8b-9c1d-1a2b3c4d5e03', '10000000-0000-4000-8000-000000000001',
   'pessoa', 'carlos-reparos', 'Carlos Reparos', 'Pequenos reparos (marido de aluguel)',
   'Montagem de móveis, pequenos reparos, troca de fechaduras e encanador geral. Levo ferramenta completa.',
   'paranagua', '{"Jardim Aurora",Centro}', true, '5541999990003',
   null, null, null, null, 4, false, 'publicado'),
  ('5f0b3c1e-2a4d-4f8b-9c1d-1a2b3c4d5e04', '10000000-0000-4000-8000-000000000001',
   'pessoa', 'hidraulica-sao-pedro', 'Seu Bento Hidráulica', 'Encanador',
   'Vazamentos, instalação de pias, caixas d''água e limpeza de fossas simples. Especialista em tubulações antigas.',
   'paranagua', '{"São Pedro","Vila Rica"}', false, '5541999990004',
   null, null, null, null, 15, true, 'publicado'),
  ('5f0b3c1e-2a4d-4f8b-9c1d-1a2b3c4d5e05', '10000000-0000-4000-8000-000000000001',
   'empresa', 'reformas-araujo', 'Reformas Araújo', 'Reforma e construção',
   'Pintura, alvenaria e reformas completas com contrato simples e orçamento sem compromisso.',
   'paranagua', '{Centro,"Jardim Aurora","Vila Rica"}', true, '5541999990005',
   null, 'Reformas Araujo Paranaguá PR', 'Seg a Sex, 7h às 17h', 4, 9, true, 'publicado'),
  ('5f0b3c1e-2a4d-4f8b-9c1d-1a2b3c4d5e06', '10000000-0000-4000-8000-000000000001',
   'pessoa', 'limpeza-rosa', 'Dona Rosa Limpeza', 'Diarista e faxina pesada',
   'Faxina residencial e comercial, pós-obra e lavagem de calçada. Referências na região.',
   'paranagua', '{"Vila Rica",Centro}', true, '5541999990006',
   null, null, null, null, 10, true, 'publicado'),
  ('5f0b3c1e-2a4d-4f8b-9c1d-1a2b3c4d5e07', '10000000-0000-4000-8000-000000000001',
   'pessoa', 'beleza-ana', 'Estúdio Ana Beleza', 'Cabeleireira e manicure',
   'Atendimento em domicílio para eventos: noivas, formaturas e diárias de beleza.',
   'paranagua', '{Centro,"São Pedro"}', false, '5541999990007',
   null, null, null, null, 6, false, 'publicado'),
  ('5f0b3c1e-2a4d-4f8b-9c1d-1a2b3c4d5e08', '10000000-0000-4000-8000-000000000001',
   'pessoa', 'frete-ze', 'Zé Fretes', 'Fretes e mudanças pequenas',
   'Carro baú para fretes rápidos, mudanças pequenas e entregas para comércios.',
   'paranagua', '{Centro,"Jardim Aurora","São Pedro"}', true, '5541999990008',
   null, null, null, null, 5, true, 'publicado'),
  ('5f0b3c1e-2a4d-4f8b-9c1d-1a2b3c4d5e09', '10000000-0000-4000-8000-000000000001',
   'pessoa', 'aulas-marcos', 'Marcos Aulas', 'Reforço escolar (matemática e física)',
   'Aulas de reforço para fundamental e ensino médio, presencial ou online.',
   'paranagua', '{Centro}', false, '5541999990009',
   null, null, null, null, 3, true, 'publicado'),
  ('5f0b3c1e-2a4d-4f8b-9c1d-1a2b3c4d5e10', '10000000-0000-4000-8000-000000000001',
   'pessoa', 'tecnica-lu', 'Lu Informática', 'Assistência técnica de computadores',
   'Formatação, limpeza de vírus, montagem de PC e configuração de redes domésticas.',
   'paranagua', '{Centro,"Jardim Aurora"}', true, '5541999990010',
   null, null, null, null, 7, true, 'publicado')
on conflict (slug) do nothing;

-- ---------- ligacao prestador <-> categoria ----------
with l as (
  select * from (values
    ('joao-eletrica','eletrica'),
    ('eletrica-morada-nova','eletrica'),
    ('eletrica-morada-nova','tecnologia'),
    ('carlos-reparos','reparos'),
    ('hidraulica-sao-pedro','hidraulica'),
    ('reformas-araujo','reforma'),
    ('limpeza-rosa','limpeza'),
    ('beleza-ana','beleza'),
    ('frete-ze','fretes'),
    ('aulas-marcos','aulas'),
    ('tecnica-lu','tecnologia')
  ) as t(pslug, cslug)
)
insert into provider_categories (provider_id, category_id)
select p.id, c.id from l
join providers p on p.slug = l.pslug
join categories c on c.slug = l.cslug
on conflict do nothing;

-- ---------- servicos (apaga e refaz para ser idempotente) ----------
delete from provider_services
where provider_id in (select id from providers
                      where user_id = '10000000-0000-4000-8000-000000000001');

with s as (
  select * from (values
    ('joao-eletrica','Instalação de chuveiro', 80.00, 1),
    ('joao-eletrica','Quadro de energia e disjuntores', 150.00, 2),
    ('joao-eletrica','Troca de tomadas e interruptores', 60.00, 3),
    ('eletrica-morada-nova','Cerca elétrica', 900.00, 1),
    ('eletrica-morada-nova','Câmeras de segurança', 1200.00, 2),
    ('eletrica-morada-nova','Manutenção elétrica comercial', 250.00, 3),
    ('carlos-reparos','Montagem de móveis', 70.00, 1),
    ('carlos-reparos','Troca de fechadura', 90.00, 2),
    ('hidraulica-sao-pedro','Detecção e correção de vazamento', 120.00, 1),
    ('hidraulica-sao-pedro','Instalação de pia e vaso', 150.00, 2),
    ('reformas-araujo','Pintura de fachada', 800.00, 1),
    ('reformas-araujo','Reforma de banheiro', 2500.00, 2),
    ('limpeza-rosa','Faxina diária', 150.00, 1),
    ('beleza-ana','Pacote noiva', 600.00, 1),
    ('frete-ze','Frete na cidade', 80.00, 1),
    ('aulas-marcos','Aula avulsa (1h)', 60.00, 1),
    ('tecnica-lu','Formatação com backup', 120.00, 1)
  ) as t(pslug, titulo, preco, ordem)
)
insert into provider_services (provider_id, titulo, preco_desde, ordem)
select p.id, s.titulo, s.preco, s.ordem
from s join providers p on p.slug = s.pslug;

-- ---------- votos rapidos (apaga e refaz; a trigger recalcula os totais) ----------
delete from quick_votes
where provider_id in (select id from providers
                      where user_id = '10000000-0000-4000-8000-000000000001');

with v as (
  select * from (values
    ('joao-eletrica', 21, 2),
    ('eletrica-morada-nova', 10, 1),
    ('carlos-reparos', 6, 1),
    ('hidraulica-sao-pedro', 30, 1),
    ('reformas-araujo', 16, 2),
    ('limpeza-rosa', 14, 1),
    ('beleza-ana', 8, 1),
    ('frete-ze', 10, 2),
    ('aulas-marcos', 6, 0),
    ('tecnica-lu', 13, 1)
  ) as t(slug, pos, neg)
)
insert into quick_votes (provider_id, voter_session_hash, voto, criado_em)
select p.id, md5(gen_random_uuid()::text),
       case when g.n <= v.pos then 1 else -1 end,
       now() - (random() * interval '45 days')
from v
join providers p on p.slug = v.slug
cross join lateral generate_series(1, v.pos + v.neg) as g(n);

-- ---------- avaliacoes de exemplo (apaga e refaz) ----------
delete from reviews
where provider_id in (select id from providers
                      where user_id = '10000000-0000-4000-8000-000000000001');

with r as (
  select * from (values
    ('joao-eletrica', '10000000-0000-4000-8000-000000000101', 5, 'Resolveu meu quadro no mesmo dia, caprichoso.', 'Marta G.', interval '3 days'),
    ('joao-eletrica', '10000000-0000-4000-8000-000000000102', 5, 'Preço justo e não sujou nada.', 'Celio P.', interval '12 days'),
    ('joao-eletrica', '10000000-0000-4000-8000-000000000103', 4, 'Bom serviço, só demorou pra chegar.', 'Dona Neusa', interval '20 days'),
    ('eletrica-morada-nova', '10000000-0000-4000-8000-000000000104', 5, 'Instalaram câmeras na loja, nota dez.', 'Seu Jorge', interval '8 days'),
    ('carlos-reparos', '10000000-0000-4000-8000-000000000105', 4, 'Montou meu guarda-roupa inteiro.', 'Patricia L.', interval '15 days'),
    ('hidraulica-sao-pedro', '10000000-0000-4000-8000-000000000106', 5, 'Achou um vazamento que dois outros não acharam.', 'Rodnei A.', interval '5 days'),
    ('hidraulica-sao-pedro', '10000000-0000-4000-8000-000000000107', 5, 'Preço honesto e pontual.', 'Fernanda R.', interval '17 days'),
    ('hidraulica-sao-pedro', '10000000-0000-4000-8000-000000000105', 5, 'Fechou o preço e não mudou no fim.', 'Patricia L.', interval '22 days'),
    ('reformas-araujo', '10000000-0000-4000-8000-000000000108', 5, 'Reformaram meu banheiro, ficou novo.', 'Tiao do Mercado', interval '10 days'),
    ('reformas-araujo', '10000000-0000-4000-8000-000000000109', 4, 'Bom acabamento, prazo esticou um pouco.', 'Carla M.', interval '25 days'),
    ('limpeza-rosa', '10000000-0000-4000-8000-000000000110', 5, 'Faxina pós-obra impecável.', 'Ivanildo S.', interval '6 days'),
    ('limpeza-rosa', '10000000-0000-4000-8000-000000000106', 4, 'Diarista de confiança, já é da família.', 'Rodnei A.', interval '18 days'),
    ('beleza-ana', '10000000-0000-4000-8000-000000000101', 4, 'Atendimento em casa, muito cuidadosa.', 'Marta G.', interval '11 days'),
    ('frete-ze', '10000000-0000-4000-8000-000000000102', 4, 'Frete rápido e cuidadoso com os móveis.', 'Celio P.', interval '9 days'),
    ('aulas-marcos', '10000000-0000-4000-8000-000000000103', 5, 'Meu filho melhorou a nota em um mês.', 'Dona Neusa', interval '14 days'),
    ('tecnica-lu', '10000000-0000-4000-8000-000000000104', 5, 'Recuperou meu notebook com backup completo.', 'Seu Jorge', interval '4 days')
  ) as t(slug, uid, nota, texto, autor, idade)
)
insert into reviews (provider_id, user_id, nota, texto, autor_nome, criado_em)
select p.id, r.uid::uuid, r.nota, r.texto, r.autor, now() - r.idade
from r join providers p on p.slug = r.slug
on conflict (provider_id, user_id) do nothing;

-- O modo demo exibe nota_media/total maiores que a amostra acima; fixa
-- os numeros exibidos para dar paridade com src/lib/demo.ts. Novas
-- avaliacoes/votos recalculam tudo pela trigger, como no real.
update providers set
  nota_media = v.nota,
  total_avaliacoes = v.total
from (values
  ('joao-eletrica', 4.80, 23),
  ('eletrica-morada-nova', 4.60, 11),
  ('carlos-reparos', 4.20, 7),
  ('hidraulica-sao-pedro', 4.90, 31),
  ('reformas-araujo', 4.50, 18),
  ('limpeza-rosa', 4.70, 15),
  ('beleza-ana', 4.40, 9),
  ('frete-ze', 4.30, 12),
  ('aulas-marcos', 4.90, 6),
  ('tecnica-lu', 4.60, 14)
) as v(slug, nota, total)
where providers.slug = v.slug;

-- ---------- anuncio patrocinado da cidade (apaga e refaz) ----------
delete from ads where whatsapp = '5541999990020';

insert into ads (anunciante_user_id, cidade_slug, nome_anunciante, descricao,
                 whatsapp, posicao, status, pago_ate)
values ('10000000-0000-4000-8000-000000000002', 'paranagua',
        'Padaria Central', 'Bolos e salgados para festas e eventos',
        '5541999990020', 'patrocinado_cidade', 'ativo', current_date + 30);

-- ---------- sinonimos de busca (upsert) ----------
insert into search_synonyms (termo, sinonimos, origem) values
  ('eletricista', '{eletrica,"instalacao eletrica",chuveiro,tomada}', 'manual'),
  ('encanador', '{hidraulica,vazamento,cano,pia}', 'manual'),
  ('diarista', '{limpeza,faxina,"faxina pesada"}', 'manual'),
  ('marido de aluguel', '{reparos,"pequenos reparos",montagem,fechadura}', 'manual'),
  ('frete', '{mudancas,carreto,entrega}', 'manual'),
  ('pintor', '{pintura,reforma,fachada}', 'manual'),
  ('aula', '{reforco,professor,matematica}', 'manual'),
  ('informatica', '{computador,formatacao,"tecnico de computador",virus}', 'manual'),
  ('cabeleireiro', '{beleza,manicure,cabelo,noiva}', 'manual'),
  ('pedreiro', '{reforma,construcao,alvenaria}', 'manual')
on conflict (termo) do nothing;
