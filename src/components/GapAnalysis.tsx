import { useState } from "react";
import { useStore } from "../store";
import { FRAMEWORKS, progressoFramework } from "../domain";
import { Cabecalho, Ic, Reveal } from "./ui";
import { baixarCsv, baixarExcel, baixarJson } from "../exportImport";

/* =====================================================================
   Gap Analysis — análise de lacunas entre o estado atual e os requisitos
   de cada framework, com plano de ação priorizado.
   ===================================================================== */

interface Gap {
  id: string;
  framework: string;
  controle: string;
  ref: string;
  titulo: string;
  estado: string;
  prioridade: "alta" | "media" | "baixa";
  impacto: string;
  acao: string;
  responsavel: string;
  prazo: string;
}

function analisarGaps(iso: Record<string, Record<string, { estado: string }>>): Gap[] {
  const gaps: Gap[] = [];
  FRAMEWORKS.forEach((fw) => {
    const mapa = iso[fw.id] ?? {};
    fw.controles.forEach((ctl) => {
      const st = mapa[ctl.id]?.estado ?? "nao";
      if (st === "nao" || st === "andamento") {
        gaps.push({
          id: `${fw.id}-${ctl.id}`,
          framework: fw.codigo,
          controle: ctl.id,
          ref: ctl.ref,
          titulo: ctl.titulo,
          estado: st === "nao" ? "Não iniciado" : "Em andamento",
          prioridade: fw.id === "iso27001" || fw.id === "pcidss" ? "alta" : fw.id === "soc2" ? "media" : "baixa",
          impacto: st === "nao" ? "Risco de não conformidade" : "Atraso na implementação",
          acao: st === "nao" ? "Iniciar implementação" : "Concluir implementação",
          responsavel: "A definir",
          prazo: st === "nao" ? "30 dias" : "15 dias",
        });
      }
    });
  });
  return gaps.sort((a, b) => {
    const p = { alta: 3, media: 2, baixa: 1 };
    return p[b.prioridade] - p[a.prioridade];
  });
}

export default function GapAnalysis() {
  const { iso, toast, registrar } = useStore();
  const [filtro, setFiltro] = useState<string>("todos");
  const [prioridade, setPrioridade] = useState<string>("todas");

  const gaps = analisarGaps(iso);
  const filtrados = gaps.filter((g) => {
    if (filtro !== "todos" && g.framework !== filtro) return false;
    if (prioridade !== "todas" && g.prioridade !== prioridade) return false;
    return true;
  });

  const stats = {
    total: gaps.length,
    alta: gaps.filter((g) => g.prioridade === "alta").length,
    media: gaps.filter((g) => g.prioridade === "media").length,
    baixa: gaps.filter((g) => g.prioridade === "baixa").length,
  };

  const exportarCsv = () => {
    const linhas = [
      ["Framework", "Ref", "Controle", "Estado", "Prioridade", "Impacto", "Ação", "Responsável", "Prazo"],
      ...filtrados.map((g) => [g.framework, g.ref, g.titulo, g.estado, g.prioridade, g.impacto, g.acao, g.responsavel, g.prazo]),
    ];
    baixarCsv(`gap-analysis-${Date.now()}.csv`, linhas);
    registrar("sistema", "Gap analysis exportado em CSV.");
    toast("Gap analysis exportado em CSV.");
  };

  const exportarExcel = () => {
    const linhas = [
      ["Framework", "Ref", "Controle", "Estado", "Prioridade", "Impacto", "Ação", "Responsável", "Prazo"],
      ...filtrados.map((g) => [g.framework, g.ref, g.titulo, g.estado, g.prioridade, g.impacto, g.acao, g.responsavel, g.prazo]),
    ];
    baixarExcel(`gap-analysis-${Date.now()}.xls`, linhas);
    registrar("sistema", "Gap analysis exportado em Excel.");
    toast("Gap analysis exportado em Excel.");
  };

  const exportarJson = () => {
    baixarJson(`gap-analysis-${Date.now()}.json`, { geradoEm: new Date().toISOString(), gaps: filtrados });
    registrar("sistema", "Gap analysis exportado em JSON.");
    toast("Gap analysis exportado em JSON.");
  };

  const COR_PRI = { alta: "bg-rust text-cream", media: "bg-amber text-ink", baixa: "bg-moss text-cream" };

  return (
    <div>
      <Cabecalho
        kicker="Governança · análise de lacunas"
        titulo="Gap Analysis"
        desc="Identifique lacunas entre o estado atual e os requisitos de cada framework, com plano de ação priorizado e exportação em múltiplos formatos."
        acao={
          <div className="flex gap-2">
            <button onClick={exportarCsv} className="inline-flex items-center gap-2 rounded-md border border-sand bg-cream px-3 py-2 text-[12px] font-bold text-ink-soft transition hover:border-moss hover:text-moss">
              <Ic name="download" size={13} /> CSV
            </button>
            <button onClick={exportarExcel} className="inline-flex items-center gap-2 rounded-md border border-sand bg-cream px-3 py-2 text-[12px] font-bold text-ink-soft transition hover:border-moss hover:text-moss">
              <Ic name="download" size={13} /> Excel
            </button>
            <button onClick={exportarJson} className="inline-flex items-center gap-2 rounded-md bg-pine px-3 py-2 text-[12px] font-bold text-lime transition hover:bg-pine-deep">
              <Ic name="download" size={13} /> JSON
            </button>
          </div>
        }
      />

      <Reveal>
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { l: "Total de gaps", v: stats.total, cor: "text-ink" },
            { l: "Prioridade alta", v: stats.alta, cor: "text-rust" },
            { l: "Prioridade média", v: stats.media, cor: "text-amber" },
            { l: "Prioridade baixa", v: stats.baixa, cor: "text-moss" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg border border-sand bg-cream p-4">
              <p className="text-[10.5px] font-bold tracking-[0.12em] text-ink-faint uppercase">{s.l}</p>
              <p className={`font-display mt-2 text-[30px] leading-none font-extrabold ${s.cor}`}>{s.v}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={60}>
        <div className="mb-4 flex flex-wrap gap-2">
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="rounded-md border border-sand bg-cream px-3 py-2 text-[12px] font-bold text-ink-soft outline-none focus:border-moss">
            <option value="todos">Todos os frameworks</option>
            {FRAMEWORKS.map((fw) => <option key={fw.id} value={fw.codigo}>{fw.codigo}</option>)}
          </select>
          <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)} className="rounded-md border border-sand bg-cream px-3 py-2 text-[12px] font-bold text-ink-soft outline-none focus:border-moss">
            <option value="todas">Todas as prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
          <span className="ml-auto self-center text-[11px] font-semibold text-ink-faint">{filtrados.length} de {gaps.length} gaps</span>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="overflow-hidden rounded-lg border border-sand bg-cream">
          {filtrados.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <Ic name="check" size={30} className="mx-auto text-moss" />
              <p className="font-display mt-3 text-[16px] font-bold text-ink">Nenhuma lacuna encontrada</p>
              <p className="mt-1 text-[12.5px] text-ink-soft">Todos os controles estão implementados ou verificados.</p>
            </div>
          ) : (
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-sand bg-paper text-[10px] font-bold tracking-[0.1em] text-ink-faint uppercase">
                  <th className="px-4 py-2.5">Framework</th>
                  <th className="px-3 py-2.5">Ref</th>
                  <th className="px-3 py-2.5">Controle</th>
                  <th className="px-3 py-2.5">Prioridade</th>
                  <th className="px-3 py-2.5">Ação</th>
                  <th className="px-3 py-2.5">Prazo</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((g) => (
                  <tr key={g.id} className="border-b border-sand/70 last:border-0 hover:bg-paper">
                    <td className="px-4 py-3 font-bold text-ink">{g.framework}</td>
                    <td className="px-3 py-3 text-ink-soft">{g.ref}</td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-ink">{g.titulo}</p>
                      <p className="text-[10.5px] text-ink-faint">{g.estado}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${COR_PRI[g.prioridade]}`}>{g.prioridade}</span>
                    </td>
                    <td className="px-3 py-3 text-ink-soft">{g.acao}</td>
                    <td className="px-3 py-3 font-semibold text-ink">{g.prazo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Reveal>
    </div>
  );
}
