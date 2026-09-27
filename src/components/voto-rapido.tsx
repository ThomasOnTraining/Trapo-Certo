"use client";

import { useState } from "react";
import { Icone } from "./icones";
import { idSessao } from "@/lib/sessao";

/** Voto rapido: recomendo ou nao, 1 clique, sem pagina nova. */
export function VotoRapido({
  prestadorId,
  positivos,
  negativos,
}: {
  prestadorId: string;
  positivos: number;
  negativos: number;
}) {
  const [votou, setVotou] = useState<"positivo" | "negativo" | null>(null);
  const [contagem, setContagem] = useState({ positivos, negativos });

  async function votar(voto: "positivo" | "negativo") {
    if (votou) return;
    setVotou(voto);
    setContagem((c) => ({
      ...c,
      [voto === "positivo" ? "positivos" : "negativos"]:
        voto === "positivo" ? c.positivos + 1 : c.negativos + 1,
    }));
    try {
      await fetch("/api/quick-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prestadorId, voto, sessao: idSessao() }),
      });
    } catch {
      // voto nunca trava a pagina
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-tinta/70">Recomendo?</span>
      <button
        type="button"
        onClick={() => votar("positivo")}
        disabled={!!votou}
        className={`botao-afunda inline-flex items-center gap-1.5 border-2 px-2.5 py-1 text-sm font-semibold ${
          votou === "positivo"
            ? "border-verde-trampo bg-verde-claro text-verde-trampo"
            : "border-cinza-linha hover:border-verde-trampo"
        }`}
        style={{ borderRadius: 10 }}
        aria-label="Recomendo"
      >
        <Icone nome="joinha" tamanho={15} /> {contagem.positivos}
      </button>
      <button
        type="button"
        onClick={() => votar("negativo")}
        disabled={!!votou}
        className={`botao-afunda inline-flex items-center gap-1.5 border-2 px-2.5 py-1 text-sm font-semibold ${
          votou === "negativo"
            ? "border-verde-fundo bg-verde-papel"
            : "border-cinza-linha hover:border-verde-fundo"
        }`}
        style={{ borderRadius: 10 }}
        aria-label="Não recomendo"
      >
        <Icone nome="joinhaBaixo" tamanho={15} /> {contagem.negativos}
      </button>
    </div>
  );
}
