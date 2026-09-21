"use client";

import { useState } from "react";

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
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: "quick_vote",
          props: { prestadorId, voto },
          consent: true, // demo: substituir pelo consentimento real do cookie
        }),
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
        className={`botao-afunda border-2 px-2.5 py-1 text-sm font-semibold ${
          votou === "positivo"
            ? "border-verde-trampo bg-verde-claro"
            : "border-cinza-linha hover:border-verde-trampo"
        }`}
        style={{ borderRadius: 8 }}
        aria-label="Recomendo"
      >
        👍 {contagem.positivos}
      </button>
      <button
        type="button"
        onClick={() => votar("negativo")}
        disabled={!!votou}
        className={`botao-afunda border-2 px-2.5 py-1 text-sm font-semibold ${
          votou === "negativo"
            ? "border-verde-fundo bg-verde-papel"
            : "border-cinza-linha hover:border-verde-fundo"
        }`}
        style={{ borderRadius: 8 }}
        aria-label="Não recomendo"
      >
        👎 {contagem.negativos}
      </button>
    </div>
  );
}
