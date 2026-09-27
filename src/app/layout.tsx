import type { Metadata, Viewport } from "next";
import { Archivo, Nunito_Sans } from "next/font/google";
import Link from "next/link";
import { BannerCookies } from "@/components/banner-cookies";
import { Icone } from "@/components/icones";
import { LinkConta } from "@/components/link-conta";
import { jsonLdPrestador } from "@/lib/seo";
import { BAIRROS } from "@/lib/demo";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-archivo",
  display: "swap",
});

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://trampocerto.com.br"),
  title: {
    default: "Trampo Certo | Serviços da cidade avaliados por moradores",
    template: "%s | Trampo Certo",
  },
  description:
    "Catálogo de prestadores de serviço da cidade: eletricista, encanador, diarista e mais, com avaliações de quem mora aqui e WhatsApp direto.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/*
  Cabecalho global: logo volta pra home em QUALQUER pagina (antes so a
  home tinha barra — painel/busca/entrar deixavam o usuario preso).
  O botao de conta e um componente de cliente (link-conta.tsx): ele ve a
  sessao sem obrigar o layout a virar dinamico.
*/
function BarraTopo() {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-verde-fundo bg-papel">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2">
        <Link href="/" className="shrink-0 -rotate-2">
          <span className="block bg-verde-fundo px-2 py-1 font-display text-sm uppercase leading-[0.95] text-papel">
            Trampo
            <br />
            Certo
            <span className="ml-1 text-amarelo-aviso">✓</span>
          </span>
        </Link>
        <div className="min-w-0 flex-1" />
        <Link
          href="/busca"
          className="hidden shrink-0 text-sm font-bold uppercase tracking-wide text-verde-fundo underline underline-offset-4 hover:text-verde-trampo sm:block"
        >
          Buscar
        </Link>
        <LinkConta variacao="topo" />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            jsonLdPrestador({
              nome: "Trampo Certo",
              profissao: "Catálogo de serviços",
              notaMedia: 4.8,
              totalAvaliacoes: 146,
              verificado: true,
              bairros: BAIRROS,
            })
          ),
        }}
      />
    </header>
  );
}

function Rodape() {
  const link =
    "font-semibold underline decoration-verde-trampo underline-offset-4 hover:text-amarelo-aviso";
  return (
    <footer className="mt-10 bg-verde-fundo text-papel">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm">
        <p className="font-display text-2xl uppercase leading-none">
          Trampo Certo
          <span className="ml-1 inline-block -rotate-6 text-amarelo-aviso">✓</span>
        </p>
        <p className="regra-tracejada mt-4 max-w-2xl pt-4 text-papel/75" style={{ borderColor: "var(--color-verde-trampo)" }}>
          O Trampo Certo é um catálogo de divulgação de prestadores de serviço.
          Não contratamos, não intermediamos e não garantimos a execução de
          nenhum trabalho. A negociação é feita direto entre você e o
          profissional.
        </p>
        <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/termos" className={link}>
            Termos de uso
          </Link>
          <Link href="/privacidade" className={link}>
            Política de privacidade
          </Link>
          <Link href="/aviso-legal" className={link}>
            Aviso legal
          </Link>
          <Link href="/cookies" className={link}>
            Privacidade e cookies
          </Link>
          <a href="/llms.txt" className={link}>
            llms.txt
          </a>
        </nav>
      </div>
    </footer>
  );
}

/** Navegacao inferior mobile: padrao de app, essenciais a um toque. */
function BarraInferior() {
  const item =
    "flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold uppercase tracking-wide text-verde-fundo hover:bg-verde-claro active:bg-verde-claro";
  return (
    <nav
      aria-label="Navegação principal"
      className="sticky bottom-0 z-30 grid grid-cols-3 border-t-2 border-verde-fundo bg-papel md:hidden"
    >
      <Link href="/" className={item}>
        <Icone nome="loja" tamanho={20} />
        Catálogo
      </Link>
      <Link href="/busca" className={item}>
        <Icone nome="busca" tamanho={20} />
        Buscar
      </Link>
      <LinkConta variacao="inferior" />
    </nav>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${nunito.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <BarraTopo />
        <div className="flex-1">{children}</div>
        <Rodape />
        <BarraInferior />
        <BannerCookies />
      </body>
    </html>
  );
}
