import type { Metadata, Viewport } from "next";
import { Archivo, Nunito_Sans } from "next/font/google";
import Link from "next/link";
import { BannerCookies } from "@/components/banner-cookies";
import { Icone } from "@/components/icones";
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

function Rodape() {
  return (
    <footer className="mt-10 border-t-2 border-verde-fundo bg-verde-papel">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm">
        <p className="font-display text-base uppercase text-verde-fundo">
          Trampo Certo ✓
        </p>
        <p className="mt-1 max-w-2xl text-tinta/80">
          O Trampo Certo é um catálogo de divulgação de prestadores de serviço.
          Não contratamos, não intermediamos e não garantimos a execução de
          nenhum trabalho. A negociação é feita direto entre você e o
          profissional.
        </p>
        <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/termos" className="underline hover:text-verde-trampo">
            Termos de uso
          </Link>
          <Link href="/privacidade" className="underline hover:text-verde-trampo">
            Política de privacidade
          </Link>
          <Link href="/aviso-legal" className="underline hover:text-verde-trampo">
            Aviso legal
          </Link>
          <Link href="/cookies" className="underline hover:text-verde-trampo">
            Privacidade e cookies
          </Link>
          <a href="/llms.txt" className="underline hover:text-verde-trampo">
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
    "flex flex-col items-center gap-0.5 py-1 text-xs font-semibold text-verde-fundo hover:text-verde-trampo";
  return (
    <nav
      aria-label="Navegação principal"
      className="sticky bottom-0 z-30 grid grid-cols-3 border-t-2 border-verde-fundo bg-papel md:hidden"
    >
      <Link href="/" className={item}>
        <Icone nome="busca" tamanho={20} />
        Início
      </Link>
      <Link href="/busca" className={item}>
        <Icone nome="estrela" tamanho={20} />
        Buscar
      </Link>
      <Link href="/entrar" className={item}>
        <Icone nome="coracao" tamanho={20} />
        Salvos
      </Link>
    </nav>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${nunito.variable}`}>
      <body className="flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
        <Rodape />
        <BarraInferior />
        <BannerCookies />
      </body>
    </html>
  );
}
