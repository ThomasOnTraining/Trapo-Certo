"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseNavegador } from "@/lib/supabase/navegador";
import { Campo, CampoTexto, CLASSE_BOTAO } from "./campos";
import type { CategoriaPainel, MeuPerfil, RascunhoServico } from "./tipos";

/*
  Editor do perfil: SÓ edição de conteúdo (dados, bairros, links,
  categorias, serviços e preços). Métricas e moderação ficam em telas
  separadas — esta tela não mostra número de desempenho nenhum.

  A gravação roda no navegador com o JWT do dono: RLS de dono + grant de
  coluna são a autorização (status/verificado/stats ficam congelados).
*/
export function EditorPerfil({
  perfil,
  categorias,
}: {
  perfil: MeuPerfil;
  categorias: CategoriaPainel[];
}) {
  const router = useRouter();
  const [tipo, setTipo] = useState(perfil.tipo);
  const [nome, setNome] = useState(perfil.nome);
  const [profissao, setProfissao] = useState(perfil.profissao);
  const [bio, setBio] = useState(perfil.bio);
  const [whatsapp, setWhatsapp] = useState(perfil.whatsapp);
  const [bairros, setBairros] = useState(perfil.bairros.join(", "));
  const [disponivelHoje, setDisponivelHoje] = useState(perfil.disponivelHoje);
  const [gmapsUrl, setGmapsUrl] = useState(perfil.gmapsUrl ?? "");
  const [mapsQuery, setMapsQuery] = useState(perfil.mapsQuery ?? "");
  const [site, setSite] = useState(perfil.site ?? "");
  const [horario, setHorario] = useState(perfil.horario ?? "");
  const [equipe, setEquipe] = useState(perfil.equipe?.toString() ?? "");
  const [anosRegiao, setAnosRegiao] = useState(perfil.anosRegiao.toString());
  const [catSel, setCatSel] = useState<string[]>(
    perfil.categorias.map((c) => c.id)
  );
  const [servicos, setServicos] = useState<RascunhoServico[]>(
    perfil.servicos.map((s) => ({
      id: s.id,
      titulo: s.titulo,
      preco: s.precoDesde == null ? "" : String(s.precoDesde),
    }))
  );
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(
    null
  );

  function alternarCat(id: string) {
    setCatSel((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function salvar() {
    setMsg(null);
    const db = supabaseNavegador();
    if (!db) {
      setMsg({ tipo: "erro", texto: "Login não configurado." });
      return;
    }
    const soDigitos = whatsapp.replace(/\D/g, "");
    if (nome.trim().length < 2)
      return setMsg({ tipo: "erro", texto: "Informe o nome." });
    if (profissao.trim().length < 2)
      return setMsg({ tipo: "erro", texto: "Informe a profissão." });
    if (!/^[0-9]{10,13}$/.test(soDigitos))
      return setMsg({
        tipo: "erro",
        texto: "WhatsApp inválido: números com DDD, só dígitos.",
      });

    const nulo = (s: string) => (s.trim() === "" ? null : s.trim());
    const eq = parseInt(equipe, 10);
    const listaServicos = servicos.filter((s) => s.titulo.trim() !== "");

    setSalvando(true);
    try {
      // Somente colunas com grant de dono; status/verificado/stats ficam congelados
      const { error } = await db
        .from("providers")
        .update({
          tipo,
          nome: nome.trim(),
          profissao: profissao.trim(),
          bio: bio.trim(),
          whatsapp: soDigitos,
          bairros: bairros
            .split(",")
            .map((b) => b.trim())
            .filter(Boolean)
            .slice(0, 12),
          disponivel_hoje: disponivelHoje,
          gmaps_url: nulo(gmapsUrl),
          maps_query: nulo(mapsQuery),
          site: nulo(site),
          horario: nulo(horario),
          equipe: Number.isFinite(eq) && eq >= 1 ? eq : null,
          anos_regiao: parseInt(anosRegiao, 10) || 0,
        })
        .eq("id", perfil.id);
      if (error) throw error;

      await db.from("provider_categories").delete().eq("provider_id", perfil.id);
      if (catSel.length > 0) {
        const { error: eCat } = await db.from("provider_categories").insert(
          catSel.map((id) => ({ provider_id: perfil.id, category_id: id }))
        );
        if (eCat) throw eCat;
      }

      await db.from("provider_services").delete().eq("provider_id", perfil.id);
      if (listaServicos.length > 0) {
        const { error: eSvc } = await db.from("provider_services").insert(
          listaServicos.map((s, i) => {
            const p = Number(s.preco.replace(",", "."));
            return {
              provider_id: perfil.id,
              titulo: s.titulo.trim(),
              preco_desde: Number.isFinite(p) && p >= 0 ? p : null,
              ordem: i,
            };
          })
        );
        if (eSvc) throw eSvc;
      }

      setMsg({
        tipo: "ok",
        texto: perfil.verificado
          ? "Salvo. As alterações já estão no ar."
          : "Salvo. As alterações já estão no ar como não verificado — a equipe pode conferir seus dados depois.",
      });
      router.refresh();
    } catch {
      setMsg({ tipo: "erro", texto: "Não consegui salvar. Tente de novo." });
    } finally {
      setSalvando(false);
    }
  }


  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Tipo
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "pessoa" | "empresa")}
            className="mt-1 w-full border-2 border-verde-fundo bg-papel px-3 py-2.5 text-sm font-normal text-tinta focus:border-verde-trampo focus:outline-none"
            style={{ borderRadius: 8 }}
          >
            <option value="pessoa">Pessoa</option>
            <option value="empresa">Empresa / equipe</option>
          </select>
        </label>
        <Campo
          rotulo="Nome ou nome fantasia"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={80}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Campo
          rotulo="Profissão"
          value={profissao}
          onChange={(e) => setProfissao(e.target.value)}
          maxLength={80}
        />
        <Campo
          rotulo="WhatsApp com DDD (só números)"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          inputMode="numeric"
        />
      </div>

      <CampoTexto
        rotulo="Apresentação (quem você é, experiência)"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        maxLength={600}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Campo
          rotulo="Bairros que atende (separe por vírgula)"
          value={bairros}
          onChange={(e) => setBairros(e.target.value)}
        />
        <Campo
          rotulo="Horário de atendimento (ex.: seg–sáb, 8h–18h)"
          value={horario}
          onChange={(e) => setHorario(e.target.value)}
          maxLength={60}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Campo
          rotulo="Anos na região"
          value={anosRegiao}
          onChange={(e) => setAnosRegiao(e.target.value)}
          inputMode="numeric"
        />
        <Campo
          rotulo={tipo === "empresa" ? "Tamanho da equipe" : "Equipe (opcional)"}
          value={equipe}
          onChange={(e) => setEquipe(e.target.value)}
          inputMode="numeric"
        />
        <label className="flex items-end gap-2 pb-2.5 text-sm font-semibold">
          <input
            type="checkbox"
            checked={disponivelHoje}
            onChange={(e) => setDisponivelHoje(e.target.checked)}
            className="h-5 w-5 accent-verde-trampo"
          />
          Disponível hoje
        </label>
      </div>

      <details className="border-2 border-cinza-linha p-3" style={{ borderRadius: 8 }}>
        <summary className="cursor-pointer text-sm font-bold uppercase tracking-wide text-tinta">
          Links e mapa (opcional)
        </summary>
        <div className="mt-3 space-y-3">
          <Campo
            rotulo="Site ou rede social"
            value={site}
            onChange={(e) => setSite(e.target.value)}
            maxLength={200}
          />
          <Campo
            rotulo="Link do Google Maps do seu negócio"
            value={gmapsUrl}
            onChange={(e) => setGmapsUrl(e.target.value)}
            maxLength={300}
          />
          <Campo
            rotulo="Endereço para busca no mapa (ex.: Rua X, Centro)"
            value={mapsQuery}
            onChange={(e) => setMapsQuery(e.target.value)}
            maxLength={120}
          />
        </div>
      </details>

      <fieldset>
        <legend className="text-sm font-semibold">Categorias de serviço</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {categorias.map((c) => (
            <label
              key={c.id}
              className={`cursor-pointer border-2 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide ${
                catSel.includes(c.id)
                  ? "border-verde-trampo bg-verde-claro text-verde-trampo"
                  : "border-cinza-linha bg-papel text-tinta/70"
              }`}
              style={{ borderRadius: 8 }}
            >
              <input
                type="checkbox"
                checked={catSel.includes(c.id)}
                onChange={() => alternarCat(c.id)}
                className="sr-only"
              />
              {c.nome}
            </label>
          ))}
        </div>
      </fieldset>


      <fieldset>
        <legend className="text-sm font-semibold">Serviços e preços</legend>
        <div className="mt-2 space-y-2">
          {servicos.map((s, i) => (
            <div key={s.id ?? `novo-${i}`} className="flex gap-2">
              <input
                value={s.titulo}
                onChange={(e) =>
                  setServicos((prev) =>
                    prev.map((x, j) =>
                      j === i ? { ...x, titulo: e.target.value } : x
                    )
                  )
                }
                placeholder="Ex.: Troca de tomada"
                maxLength={80}
                className="w-full flex-1 border-2 border-verde-fundo bg-papel px-3 py-2 text-sm text-tinta focus:border-verde-trampo focus:outline-none"
                style={{ borderRadius: 8 }}
              />
              <input
                value={s.preco}
                onChange={(e) =>
                  setServicos((prev) =>
                    prev.map((x, j) =>
                      j === i ? { ...x, preco: e.target.value } : x
                    )
                  )
                }
                placeholder="R$ desde"
                inputMode="decimal"
                className="w-24 border-2 border-verde-fundo bg-papel px-2 py-2 text-sm text-tinta focus:border-verde-trampo focus:outline-none sm:w-28"
                style={{ borderRadius: 8 }}
              />
              <button
                type="button"
                onClick={() =>
                  setServicos((prev) => prev.filter((_, j) => j !== i))
                }
                className="border-2 border-cinza-linha px-2 text-xs font-bold text-tinta/70 hover:bg-verde-papel"
                style={{ borderRadius: 8 }}
                aria-label={`Remover serviço ${i + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setServicos((prev) => [
                ...prev,
                { id: null, titulo: "", preco: "" },
              ])
            }
            className={`${CLASSE_BOTAO} border-cinza-linha text-tinta hover:bg-verde-papel`}
            style={{ borderRadius: 8 }}
          >
            + Adicionar serviço
          </button>
        </div>
      </fieldset>

      {msg && (
        <p
          className={
            msg.tipo === "erro"
              ? "border-2 border-amarelo-aviso bg-amarelo-aviso/10 p-2.5 text-sm font-semibold text-verde-fundo"
              : "border-2 border-verde-trampo bg-verde-claro p-2.5 text-sm font-semibold text-verde-fundo"
          }
          style={{ borderRadius: 8 }}
          role={msg.tipo === "erro" ? "alert" : "status"}
        >
          {msg.texto}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          onClick={salvar}
          disabled={salvando}
          className={`${CLASSE_BOTAO} border-verde-trampo bg-verde-trampo text-papel hover:bg-verde-trampo-forte`}
          style={{ borderRadius: 10 }}
        >
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
        <Link
          href="/painel"
          className="text-xs font-bold uppercase tracking-wide text-tinta/70 underline underline-offset-2 hover:text-verde-trampo"
        >
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
}
