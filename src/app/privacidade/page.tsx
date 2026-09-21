import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de privacidade" };

export default function Privacidade() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="border-b-2 border-verde-fundo pb-1 font-display text-2xl uppercase text-verde-fundo">
        Política de privacidade
      </h1>
      <div className="mt-4 space-y-3 text-sm leading-relaxed">
        <p>
          Coletamos o mínimo possível. Este site funciona sem conta para quem
          busca serviço; o cadastro só é necessário para anunciar um perfil ou
          escrever avaliações.
        </p>
        <p>
          <strong>O que coletamos:</strong> dados que você declara no cadastro
          (nome, e-mail de acesso, informações do perfil público); métricas
          anônimas de uso (páginas vistas, buscas, cliques), com IP e sessão
          <strong> hasheados</strong> de forma irreversível; e o
          consentimento de cookies.
        </p>
        <p>
          <strong>O que não coletamos:</strong> senha (o acesso é por Google
          ou e-mail com código de uso único); conversas de WhatsApp (acontecem
          fora da plataforma); histórico de navegação entre dias para
          quem recusou cookies de métricas.
        </p>
        <p>
          <strong>Para quem anuncia:</strong> o acesso à conta é feito por
          provedores (Google ou Microsoft) e o banco de dados não armazena
          senha alguma. Documentos enviados para verificação ficam em
          armazenamento privado, criptografado, visíveis só para a moderação.
        </p>
        <p>
          <strong>Seus direitos (LGPD):</strong> pedir a exclusão da sua conta
          e dados a qualquer momento pelo mesmo canal de contato. Métricas são
          agregadas: não montamos perfis individuais de navegação.
        </p>
      </div>
    </main>
  );
}
