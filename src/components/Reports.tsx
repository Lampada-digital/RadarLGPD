import { useMemo } from "react";
import { useStore } from "../store";
import { CATEGORIAS_DADOS, TODAS_BASES, fmtData, zonaRisco, ZONA_META } from "../types";
import { Cabecalho, Ic, Reveal } from "./ui";

function baixar(nome: string, conteudo: string, tipo: string) {
  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const { atividades, solicitacoes, score, reset, toast } = useStore();

  const resumo = useMemo(() => {
    const dados = new Set(atividades.flatMap((a) => a.dados));
    const sensiveis = [...dados].filter((d) => CATEGORIAS_DADOS.find((c) => c.id === d)?.sensivel);
    const alto = atividades.filter((a) => ["alto", "critico"].includes(zonaRisco(a.probabilidade * a.impacto)));
    const bases = new Map<string, number>();
    atividades.forEach((a) => bases.set(a.baseLegalId, (bases.get(a.baseLegalId) ?? 0) + 1));
    const principal = [...bases.entries()].sort((a, b) => b[1] - a[1])[0];
    return { dados: dados.size, sensiveis: sensiveis.length, alto: alto.length, principal };
  }, [atividades]);

  const exportarJSON = () => {
    baixar(`radar-lgpd-registros-${Date.now()}.json`, JSON.stringify({ geradoEm: new Date().toISOString(), indiceMaturidade: score, atividades, solicitacoes }, null, 2), "application/json");
    toast("Relatório JSON exportado.");
  };

  const exportarCSV = () => {
    const cab = ["Atividade", "Area", "Responsavel", "Finalidade", "Base legal", "Titulares", "Categorias de dados", "Retencao", "Compartilhamento", "Transferencia internacional", "Probabilidade", "Impacto", "Risco", "Medidas", "Criado em"];
    const lin = atividades.map((a) =>
      [
        a.nome, a.area, a.responsavel, a.finalidade,
        TODAS_BASES.find((b) => b.id === a.baseLegalId)?.inciso ?? a.baseLegalId,
        a.sujeitos.join("; "), a.dados.map((d) => CATEGORIAS_DADOS.find((c) => c.id === d)?.label ?? d).join("; "),
        a.retencao, a.compartilhamento.join("; "), a.transferenciaInternacional ? "Sim" : "Nao",
        a.probabilidade, a.impacto, a.probabilidade * a.impacto, a.medidas.join("; "), fmtData(a.criadoEm),
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    );
    baixar(`radar-lgpd-ropa-${Date.now()}.csv`, "\uFEFF" + [cab.join(","), ...lin].join("\n"), "text/csv;charset=utf-8");
    toast("RoPA exportado em CSV (compatível com planilhas).");
  };

  const exportarMD = () => {
    const linhas = atividades.map((a, i) => {
      const b = TODAS_BASES.find((x) => x.id === a.baseLegalId);
      const z = zonaRisco(a.probabilidade * a.impacto);
      return `## ${i + 1}. ${a.nome}\n\n- **Área / Responsável:** ${a.area} · ${a.responsavel}\n- **Finalidade:** ${a.finalidade}\n- **Base legal:** ${b?.inciso} — ${b?.titulo}\n- **Titulares:** ${a.sujeitos.join(", ")}\n- **Dados:** ${a.dados.map((d) => CATEGORIAS_DADOS.find((c) => c.id === d)?.label ?? d).join(", ")}\n- **Retenção:** ${a.retencao}${a.retencaoJustificativa ? ` (${a.retencaoJustificativa})` : ""}\n- **Compartilhamento:** ${a.compartilhamento.join(", ") || "—"}\n- **Transferência internacional:** ${a.transferenciaInternacional ? "Sim" : "Não"}\n- **Risco:** ${ZONA_META[z].label} (${a.probabilidade * a.impacto}/25) — P${a.probabilidade} × I${a.impacto}\n- **Medidas:** ${a.medidas.join("; ") || "—"}\n`;
    });
    const md = `# Registro das Operações de Tratamento (RoPA)\n\n**Controlador:** sua organização · **Encarregado:** Helena Duarte (dpo@empresa.com.br)\n**Gerado em:** ${new Date().toLocaleDateString("pt-BR")} · **Índice de maturidade:** ${score}/100 · **Base:** Art. 37, Lei nº 13.709/2018\n\n---\n\n${linhas.join("\n")}`;
    baixar(`radar-lgpd-ropa-${Date.now()}.md`, md, "text/markdown;charset=utf-8");
    toast("RoPA exportado em Markdown.");
  };

  return (
    <div>
      <Cabecalho
        kicker="Prestação de contas · Art. 37 e 50"
        titulo="Relatório RoPA"
        desc="Documento formal do registro de operações, pronto para auditoria, ANPD ou conselho. Exporte nos formatos abaixo ou imprima diretamente."
        acao={
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2.5 text-[13px] font-bold text-lime shadow-sm transition hover:bg-pine-deep active:scale-[0.98] print:hidden">
            <Ic name="printer" size={14} /> Imprimir / PDF
          </button>
        }
      />

      {/* ações de exportação */}
      <Reveal>
        <div className="mb-5 grid gap-3 print:hidden sm:grid-cols-3">
          {[
            { t: "JSON estruturado", d: "Dados completos para integração com outros sistemas de GRC.", acao: exportarJSON },
            { t: "CSV / Planilha", d: "RoPA tabular com BOM UTF-8 — abre direto no Excel.", acao: exportarCSV },
            { t: "Markdown", d: "Documento RoPA formatado, ideal para wiki interna.", acao: exportarMD },
          ].map((e) => (
            <button key={e.t} onClick={e.acao} className="group rounded-lg border border-sand bg-cream p-4 text-left transition hover:-translate-y-0.5 hover:border-moss/50 hover:shadow-[0_12px_28px_-16px_rgba(19,46,38,0.4)]">
              <div className="flex items-center justify-between">
                <span className="grid size-8 place-items-center rounded-md bg-paper-deep text-moss transition group-hover:bg-pine group-hover:text-lime"><Ic name="download" size={15} /></span>
                <Ic name="arrow" size={14} className="text-sand transition group-hover:translate-x-1 group-hover:text-moss" />
              </div>
              <p className="font-display mt-2.5 text-[14.5px] font-bold text-ink">{e.t}</p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-ink-soft">{e.d}</p>
            </button>
          ))}
        </div>
      </Reveal>

      {/* documento imprimível */}
      <Reveal>
        <div className="overflow-hidden rounded-xl border border-sand bg-cream print:rounded-none print:border-0">
          <div className="border-b border-sand bg-pine px-6 py-5 text-cream print:bg-cream print:text-ink">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.18em] text-lime uppercase print:text-moss">Registro das Operações de Tratamento · Art. 37</p>
                <h2 className="font-display mt-1 text-[22px] font-extrabold">Relatório de Mapeamento de Dados — LGPD</h2>
              </div>
              <div className="text-right text-[11.5px] leading-relaxed text-cream/70 print:text-ink-soft">
                <p>Gerado em {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
                <p>Índice de maturidade: <strong className="text-lime print:text-moss">{score}/100</strong> · {atividades.length} atividades</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-sand sm:grid-cols-4">
            {[
              { l: "Categorias de dados", v: String(resumo.dados) },
              { l: "Tratam dados sensíveis", v: String(resumo.sensiveis) },
              { l: "Atividades de alto risco", v: String(resumo.alto) },
              { l: "Base mais utilizada", v: TODAS_BASES.find((b) => b.id === resumo.principal?.[0])?.inciso ?? "—" },
            ].map((s) => (
              <div key={s.l} className="bg-cream px-4 py-3.5">
                <p className="text-[10px] font-bold tracking-[0.12em] text-ink-faint uppercase">{s.l}</p>
                <p className="font-display mt-1 text-[20px] leading-none font-extrabold text-ink">{s.v}</p>
              </div>
            ))}
          </div>

          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-y border-sand bg-paper text-[10px] font-bold tracking-[0.1em] text-ink-faint uppercase">
                <th className="px-4 py-2.5">Atividade</th>
                <th className="px-3 py-2.5">Base legal</th>
                <th className="px-3 py-2.5">Retenção</th>
                <th className="hidden px-3 py-2.5 md:table-cell">Compartilhamento</th>
                <th className="px-3 py-2.5">Risco</th>
              </tr>
            </thead>
            <tbody>
              {atividades.map((a) => {
                const z = zonaRisco(a.probabilidade * a.impacto);
                return (
                  <tr key={a.id} className="border-b border-sand/70 align-top transition last:border-0 hover:bg-paper">
                    <td className="px-4 py-3">
                      <p className="font-display text-[13px] font-bold text-ink">{a.nome}</p>
                      <p className="mt-0.5 text-[11px] text-ink-soft">{a.area} · {a.sujeitos.join(", ")}</p>
                      <p className="mt-0.5 text-[10.5px] text-ink-faint">{a.dados.map((d) => CATEGORIAS_DADOS.find((c) => c.id === d)?.label ?? d).join(" · ")}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-bold text-moss">{TODAS_BASES.find((b) => b.id === a.baseLegalId)?.inciso}</p>
                      <p className="text-[10.5px] text-ink-soft">{TODAS_BASES.find((b) => b.id === a.baseLegalId)?.titulo}</p>
                    </td>
                    <td className="px-3 py-3 text-[11.5px] text-ink-soft">{a.retencao || "—"}</td>
                    <td className="hidden px-3 py-3 text-[11.5px] text-ink-soft md:table-cell">{a.compartilhamento.join("; ") || "—"}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold" style={{ background: ZONA_META[z].bg, color: ZONA_META[z].fg }}>
                        <span className="size-1.5 rounded-full" style={{ background: ZONA_META[z].dot }} />{ZONA_META[z].label} · {a.probabilidade * a.impacto}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sand bg-paper px-5 py-3.5">
            <p className="text-[11px] text-ink-faint">Documento gerado pelo Radar LGPD · {solicitacoes.length} solicitações de titulares no histórico · revisar a cada alteração relevante (art. 37, parágrafo único).</p>
            <button onClick={() => reset()} className="inline-flex items-center gap-1.5 rounded-md border border-sand px-3 py-1.5 text-[11.5px] font-bold text-ink-soft transition hover:border-rust hover:text-rust print:hidden">
              <Ic name="refresh" size={12} /> Restaurar dados de demonstração
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
