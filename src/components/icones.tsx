import type { CSSProperties } from "react";
import {
  Broom,
  CaretLeft,
  ChartBar,
  CheckCircle,
  Clock,
  Drop,
  GearSix,
  Hammer,
  Heart,
  Lightning,
  MagnifyingGlass,
  MapPin,
  Monitor,
  PencilSimple,
  Scissors,
  ShieldCheck,
  Star,
  Storefront,
  ThumbsDown,
  ThumbsUp,
  Truck,
  User,
  WhatsappLogo,
  Wrench,
} from "@phosphor-icons/react/ssr";
import type {
  Icon as IconePhosphor,
  IconWeight,
} from "@phosphor-icons/react";

/*
  Icones Phosphor, uma familia so no projeto inteiro.
  Traco padrao "bold" (2px); estrela e coracao sempre solidos.
*/

const MAPA: Record<string, { Icon: IconePhosphor; weight: IconWeight }> = {
  bolt: { Icon: Lightning, weight: "bold" },
  gota: { Icon: Drop, weight: "bold" },
  colher: { Icon: Hammer, weight: "bold" },
  chave: { Icon: Wrench, weight: "bold" },
  vassoura: { Icon: Broom, weight: "bold" },
  tesoura: { Icon: Scissors, weight: "bold" },
  caminhao: { Icon: Truck, weight: "bold" },
  "chave-roda": { Icon: GearSix, weight: "bold" },
  tela: { Icon: Monitor, weight: "bold" },
  lapis: { Icon: PencilSimple, weight: "bold" },
  busca: { Icon: MagnifyingGlass, weight: "bold" },
  estrela: { Icon: Star, weight: "fill" },
  escudo: { Icon: ShieldCheck, weight: "bold" },
  chat: { Icon: WhatsappLogo, weight: "bold" },
  pino: { Icon: MapPin, weight: "bold" },
  voltar: { Icon: CaretLeft, weight: "bold" },
  coracao: { Icon: Heart, weight: "fill" },
  loja: { Icon: Storefront, weight: "bold" },
  joinha: { Icon: ThumbsUp, weight: "bold" },
  joinhaBaixo: { Icon: ThumbsDown, weight: "bold" },
  check: { Icon: CheckCircle, weight: "bold" },
  relogio: { Icon: Clock, weight: "bold" },
  grafico: { Icon: ChartBar, weight: "bold" },
  pessoa: { Icon: User, weight: "bold" },
};

export type NomeIcone = keyof typeof MAPA | string;

export function Icone({
  nome,
  tamanho = 24,
  className = "",
  style,
}: {
  nome: NomeIcone;
  tamanho?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const entrada = MAPA[nome] ?? MAPA["chave"];
  const { Icon, weight } = entrada;
  return (
    <Icon
      size={tamanho}
      weight={weight}
      className={className}
      style={style}
      aria-hidden="true"
    />
  );
}

/** Monograma: bloco de tinta com a letra em papel. Carrinho de feira em pixel. */
export function Monograma({ letra, tamanho = 56 }: { letra: string; tamanho?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center border-2 border-verde-fundo bg-verde-fundo font-display text-papel"
      style={{ width: tamanho, height: tamanho, borderRadius: 10, fontSize: tamanho * 0.45 }}
      aria-hidden="true"
    >
      {letra.toUpperCase()}
    </div>
  );
}
