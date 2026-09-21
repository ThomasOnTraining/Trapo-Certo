import type { ReactNode } from "react";
import { CIDADE } from "@/lib/demo";

/*
  Icones proprios: desenhamos cada um a mao, grid 24px, traco 2,
  pontas arredondadas, com um detalhe assimetrico proprio.
  Nada de biblioteca de icones generica (Font Awesome/Material),
  que e o sinal mais obvio de site template.
*/

const TRACO = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const CAMINHOS: Record<string, ReactNode> = {
  // Raio dentro de uma tomada: a mandibula aberta em angulo proprio
  bolt: (
    <>
      <path d="M13 3 L6 13 h4 L10 21 L18 10 h-4 Z" {...TRACO} />
      <path d="M3 3 v6" {...TRACO} opacity={0.55} />
    </>
  ),
  // Torneira com gota solta
  gota: (
    <>
      <path d="M4 8 h9 M6 8 v3 M11 8 v3 M4 11 h11 M9 8 v-3 h5" {...TRACO} />
      <path d="M13.5 15 c0 1.4 1 2.4 2.2 2.4 1.1 0 2-1 2-2.4 0-1.5-2-3.6-2.2-3.6 -.1 0-2 2.1-2 3.6 Z" {...TRACO} />
    </>
  ),
  // Colher de pedreiro com cabo torto de proposito
  colher: (
    <>
      <path d="M9 15 L5 11 c2-4 6-7 11-7 0 5-3 9-7 11 Z" {...TRACO} />
      <path d="M13 13 L21 21" {...TRACO} />
    </>
  ),
  // Chave inglesa com mandibula aberta
  chave: (
    <>
      <path d="M20 7 a5.5 5.5 0 0 1-7.5 5.1 L6 18.6 a2 2 0 0 1-3-2.9 L9.4 9.2 A5.5 5.5 0 0 1 15 2.5 l-3 3 1.5 3 3.5.5 Z" {...TRACO} />
    </>
  ),
  // Vassoura com tracos de vassourada
  vassoura: (
    <>
      <path d="M14 4 L9 13" {...TRACO} />
      <path d="M9 13 c-2 1-4 4-4 7 l7-2 c1-2 1-4 0-6 Z" {...TRACO} />
      <path d="M6.5 17.5 L11 16" {...TRACO} opacity={0.55} />
    </>
  ),
  // Tesoura com fio solto
  tesoura: (
    <>
      <circle cx="6" cy="17" r="2.4" {...TRACO} />
      <circle cx="17" cy="17" r="2.4" {...TRACO} />
      <path d="M8 15 L18 4 M15 15 L5 4" {...TRACO} />
    </>
  ),
  // Caminhaozinho com traco de movimento
  caminhao: (
    <>
      <path d="M3 7 h10 v8 H3 Z M13 10 h4 l3 3 v2 h-7" {...TRACO} />
      <circle cx="7" cy="17.5" r="1.6" {...TRACO} />
      <circle cx="17" cy="17.5" r="1.6" {...TRACO} />
      <path d="M0.5 11 h1.5" {...TRACO} opacity={0.55} />
    </>
  ),
  // Chave de roda
  "chave-roda": (
    <>
      <circle cx="12" cy="13" r="6.5" {...TRACO} />
      <path d="M12 3 v4 M12 19 v4 M2 13 h4 M18 13 h4" {...TRACO} />
      <circle cx="12" cy="13" r="2" {...TRACO} />
    </>
  ),
  // Tela de monitor
  tela: (
    <>
      <rect x="3" y="4.5" width="18" height="12" rx="1.5" {...TRACO} />
      <path d="M9 20 h6 M12 16.5 v3.5" {...TRACO} />
      <path d="M7 8.5 l2.5 2.5 L7 13.5" {...TRACO} opacity={0.55} />
    </>
  ),
  // Lapis de aula
  lapis: (
    <>
      <path d="M5 19 l1.5-5 L16 4.5 a2 2 0 0 1 3 3 L9.5 17.5 Z" {...TRACO} />
      <path d="M14 7 l3 3" {...TRACO} opacity={0.55} />
    </>
  ),
  // Lupa de busca
  busca: (
    <>
      <circle cx="10.5" cy="10.5" r="6" {...TRACO} />
      <path d="M15 15 L21 21" {...TRACO} />
    </>
  ),
  // Estrela (nota)
  estrela: (
    <path
      d="M12 3.5 l2.6 5.3 5.9.9 -4.3 4.1 1 5.8 -5.2-2.7 -5.2 2.7 1-5.8 -4.3-4.1 5.9-.9 Z"
      fill="currentColor"
    />
  ),
  // Escudo do verificado (carimbo)
  escudo: (
    <>
      <path d="M12 3 L19 6 v6 c0 4.5-3.2 7.5-7 9 -3.8-1.5-7-4.5-7-9 V6 Z" {...TRACO} />
      <path d="M9 12 l2.2 2.2 L15.5 10" {...TRACO} />
    </>
  ),
  // Balao de chat (WhatsApp-like generico, sem logo da marca)
  chat: (
    <>
      <path d="M4 6.5 C4 5 5 4 6.5 4 h11 C19 4 20 5 20 6.5 v8 c0 1.5-1 2.5-2.5 2.5 H10 l-5 3.5 v-3.5 h-.5 C4 17 4 16 4 14.5 Z" {...TRACO} />
      <path d="M8.5 10.5 h.01 M12 10.5 h.01 M15.5 10.5 h.01" {...TRACO} strokeWidth={2.6} />
    </>
  ),
  // Pin de mapa
  pino: (
    <>
      <path d="M12 21 c-4-4.2-6.5-7.4-6.5-10.5 a6.5 6.5 0 0 1 13 0 C18.5 13.6 16 16.8 12 21 Z" {...TRACO} />
      <circle cx="12" cy="10.5" r="2.2" {...TRACO} />
    </>
  ),
  // Setinha voltar
  voltar: <path d="M15 5 L8 12 l7 7" {...TRACO} />,
  // Estrelinha de favorito
  coracao: (
    <path
      d="M12 20 c-4.5-3.2-7.5-6-7.5-9.4 C4.5 8 6.3 6.2 8.5 6.2 c1.4 0 2.7.7 3.5 1.9 .8-1.2 2.1-1.9 3.5-1.9 2.2 0 4 1.8 4 4.4 0 3.4-3 6.2-7.5 9.4 Z"
      fill="currentColor"
    />
  ),
};

export type NomeIcone = keyof typeof CAMINHOS | string;

export function Icone({
  nome,
  tamanho = 24,
  className = "",
}: {
  nome: NomeIcone;
  tamanho?: number;
  className?: string;
}) {
  const conteudo = CAMINHOS[nome] ?? CAMINHOS["chave"];
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      {conteudo}
    </svg>
  );
}

/** Monograma tipografico: quando nao ha foto, a letra entra no quadrado verde. */
export function Monograma({ letra, tamanho = 56 }: { letra: string; tamanho?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center border-2 border-verde-fundo bg-verde-claro font-display text-verde-fundo"
      style={{ width: tamanho, height: tamanho, borderRadius: 10, fontSize: tamanho * 0.45 }}
      aria-hidden="true"
    >
      {letra.toUpperCase()}
    </div>
  );
}
