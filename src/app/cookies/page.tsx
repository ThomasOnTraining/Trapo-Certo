import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacidade e cookies" };

export default function Cookies() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="border-b-2 border-verde-fundo pb-1 font-display text-2xl uppercase text-verde-fundo">
        Privacidade e cookies
      </h1>
      <div className="mt-4 space-y-3 text-sm leading-relaxed">
        <p>
          <strong>Essenciais (sempre ativos):</strong> guardam a sua escolha
          sobre cookies e o aviso do WhatsApp já lido. Sem eles o site não
          lembra nada entre páginas.
        </p>
        <p>
          <strong>Métricas (opcional):</strong> contam páginas vistas, buscas e
          cliques de forma anônima. Identificadores de rede e de sessão são
          hasheados com chave que muda todo dia: dá para contar visitantes
          únicos do dia, mas é impossível rastrear a mesma pessoa entre dias.
          Recusar não esconde anúncio nem recursos do site.
        </p>
        <p>
          <strong>Anúncios (opcional):</strong> os anúncios do Trampo Certo são
          de comércios da própria cidade, servidos pelo nosso site. Não usamos
          pixel de redes sociais nem rastreamento entre sites. O consentimento
          só autoriza a medição detalhada dos anúncios.
        </p>
        <p>
          Você pode mudar sua escolha limpando o cookie <code>tc_consent_v1</code>{" "}
          nas configurações do navegador; o banner volta a aparecer.
        </p>
      </div>
    </main>
  );
}
