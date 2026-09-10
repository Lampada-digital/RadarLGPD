import { useState } from "react";
import { useStore } from "../store";
import { FRAMEWORKS, progressoFramework, uid } from "../domain";
import { Cabecalho, Ic, Reveal } from "./ui";
import { baixarCsv, baixarExcel, baixarJson } from "../exportImport";
import { DocPdf } from "../pdf";

/* =====================================================================
   Gap Analysis — análise de lacunas entre o estado atual e os requisitos
   de cada framework, com plano de ação priorizado e totalmente editável.
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
  status: "aberto" | "em_andamento" | "concluido";
  comentarios: string;
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
          status: st === "nao" ? "aberto" : "em_andamento",
          comentarios: "",
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
  const [gaps, setGaps] = useState<Gap[]>(() => analisarGaps(iso));
  const [filtro, setFiltro] = useState<string>("todos");
  const [prioridade, setPrioridade] = useState<string>("todas");
  const [editando, setEditando] = useState<Gap | null>(null);
  const [novo, setNovo] = useState(false);
  const [form, setForm] = useState<Partial<Gap>>({});

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
    abertos: gaps.filter((g) => g.status === "aberto").length,
    em_andamento: gaps.filter((g) => g.status === "em_andamento").length,
    concluidos: gaps.filter((g) => g.status === "concluido").length,
  };

  const atualizarGap = (gapId: string, patch: Partial<Gap>) => {
    setGaps((l) => l.map((g) => g.id === gapId ? { ...g, ...patch } : g));
    registrar("gap-analysis", `Gap ${gapId} atualizado.`);
    toast("Gap atualizado.");
  };

  const criarGap = () => {
    if (!form.framework || !form.titulo) {
      toast("Preencha framework e título.", "warn");
      return;
    }
    const novoGap: Gap = {
      id: `gap-${uid()}`,
      framework: form.framework ?? "",
      controle: form.controle ?? "",
      ref: form.ref ?? "",
      titulo: form.titulo ?? "",
      estado: form.estado ?? "Não iniciado",
      prioridade: form.prioridade ?? "media",
      impacto: form.impacto ?? "",
      acao: form.acao ?? "",
      responsavel: form.responsavel ?? "",
      prazo: form.prazo ?? "",
      status: "aberto",
      comentarios: form.comentarios ?? "",
    };
    setGaps((l) => [novoGap, ...l]);
    registrar("gap-analysis", `Novo gap criado: ${novoGap.titulo}`);
    toast("Gap criado com sucesso.");
    setNovo(false);
    setForm({});
  };

  const excluirGap = (gapId: string) => {
    setGaps((l) => l.filter((g) => g.id !== gapId));
    registrar("gap-analysis", `Gap ${gapId} excluído.`);
    toast("Gap excluído.");
  };

  const exportarCsv = () => {
    const linhas = [
      ["Framework", "Ref", "Controle", "Estado", "Prioridade", "Status", "Impacto", "Ação", "Responsável", "Prazo", "Comentários"],
      ...filtrados.map((g) => [g.framework, g.ref, g.titulo, g.estado, g.prioridade, g.status, g.impacto, g.acao, g.responsavel, g.prazo, g.comentarios]),
    ];
    baixarCsv(`gap-analysis-${Date.now()}.csv`, linhas);
    registrar("sistema", "Gap analysis exportado em CSV.");
    toast("Gap analysis exportado em CSV.");
  };

  const exportarExcel = () => {
    const linhas = [
      ["Framework", "Ref", "Controle", "Estado", "Prioridade", "Status", "Impacto", "Ação", "Responsável", "Prazo", "Comentários"],
      ...filtrados.map((g) => [g.framework, g.ref, g.titulo, g.estado, g.prioridade, g.status, g.impacto, g.acao, g.responsavel, g.prazo, g.comentarios]),
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
  const COR_STATUS = { aberto: "bg-rust-soft text-rust", em_andamento: "bg-amber-soft text-ink", concluido: "bg-moss/12 text-moss" };

  return (
    <div>
      <Cabecalho
        kicker="Governança · análise de lacunas"
        titulo="Gap Analysis"
        desc="Identifique lacunas entre o estado atual e os requisitos de cada framework, com plano de ação priorizado e totalmente editável."
        acao={
          <div className="flex gap-2">
            <button onClick={() => setNovo(true)} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-[12px] font-bold text-lime transition hover:bg-pine-deep">
              <Ic name="plus" size={13} /> Novo Gap
            </button>
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
            { l: "Em andamento", v: stats.em_andamento, cor: "text-amber" },
            { l: "Concluídos", v: stats.concluidos, cor: "text-moss" },
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
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Ação</th>
                  <th className="px-3 py-2.5">Prazo</th>
                  <th className="px-3 py-2.5">Ações</th>
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
                    <td className="px-3 py-3">
                      <select
                        value={g.status}
                        onChange={(e) => atualizarGap(g.id, { status: e.target.value as Gap["status"] })}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase outline-none ${COR_STATUS[g.status]}`}
                      >
                        <option value="aberto">Aberto</option>
                        <option value="em_andamento">Em andamento</option>
                        <option value="concluido">Concluído</option>
                      </select>
                    </td>
                    <td className="px-3 py-3 text-ink-soft">{g.acao}</td>
                    <td className="px-3 py-3 font-semibold text-ink">{g.prazo}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEditando(g)} className="rounded-md border border-sand p-1.5 text-ink-soft transition hover:border-moss hover:text-moss" title="Editar">
                          <Ic name="pencil" size={12} />
                        </button>
                        <button onClick={() => excluirGap(g.id)} className="rounded-md border border-sand p-1.5 text-ink-soft transition hover:border-rust hover:text-rust" title="Excluir">
                          <Ic name="trash" size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Reveal>

      {/* Modal de edição */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pine-deep/60 p-4" onClick={() => setEditando(null)}>
          <div className="anim-pop w-full max-w-2xl rounded-lg border border-sand bg-cream p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display mb-4 text-[18px] font-bold text-ink">Editar Gap</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Framework</span>
                <input className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={editando.framework} onChange={(e) => setEditando({ ...editando, framework: e.target.value })} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Referência</span>
                <input className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={editando.ref} onChange={(e) => setEditando({ ...editando, ref: e.target.value })} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Título</span>
                <input className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={editando.titulo} onChange={(e) => setEditando({ ...editando, titulo: e.target.value })} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Prioridade</span>
                <select className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={editando.prioridade} onChange={(e) => setEditando({ ...editando, prioridade: e.target.value as Gap["prioridade"] })}>
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Status</span>
                <select className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={editando.status} onChange={(e) => setEditando({ ...editando, status: e.target.value as Gap["status"] })}>
                  <option value="aberto">Aberto</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="concluido">Concluído</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Responsável</span>
                <input className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={editando.responsavel} onChange={(e) => setEditando({ ...editando, responsavel: e.target.value })} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Prazo</span>
                <input className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={editando.prazo} onChange={(e) => setEditando({ ...editando, prazo: e.target.value })} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Ação</span>
                <textarea className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" rows={2} value={editando.acao} onChange={(e) => setEditando({ ...editando, acao: e.target.value })} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Comentários</span>
                <textarea className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" rows={3} value={editando.comentarios} onChange={(e) => setEditando({ ...editando, comentarios: e.target.value })} />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEditando(null)} className="rounded-md border border-sand px-4 py-2 text-[13px] font-semibold text-ink-soft transition hover:bg-paper">Cancelar</button>
              <button onClick={() => { atualizarGap(editando.id, editando); setEditando(null); }} className="inline-flex items-center gap-2 rounded-md bg-pine px-5 py-2 text-[13px] font-bold text-lime transition hover:bg-pine-deep active:scale-[0.98]">
                <Ic name="check" size={14} sw={2.6} /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de novo gap */}
      {novo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pine-deep/60 p-4" onClick={() => setNovo(false)}>
          <div className="anim-pop w-full max-w-2xl rounded-lg border border-sand bg-cream p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display mb-4 text-[18px] font-bold text-ink">Novo Gap</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Framework</span>
                <select className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={form.framework ?? ""} onChange={(e) => setForm({ ...form, framework: e.target.value })}>
                  <option value="">Selecione...</option>
                  {FRAMEWORKS.map((fw) => <option key={fw.id} value={fw.codigo}>{fw.codigo}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Referência</span>
                <input className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={form.ref ?? ""} onChange={(e) => setForm({ ...form, ref: e.target.value })} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Título</span>
                <input className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={form.titulo ?? ""} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Prioridade</span>
                <select className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={form.prioridade ?? "media"} onChange={(e) => setForm({ ...form, prioridade: e.target.value as Gap["prioridade"] })}>
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Prazo</span>
                <input className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={form.prazo ?? ""} onChange={(e) => setForm({ ...form, prazo: e.target.value })} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Ação</span>
                <textarea className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" rows={2} value={form.acao ?? ""} onChange={(e) => setForm({ ...form, acao: e.target.value })} />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setNovo(false)} className="rounded-md border border-sand px-4 py-2 text-[13px] font-semibold text-ink-soft transition hover:bg-paper">Cancelar</button>
              <button onClick={criarGap} className="inline-flex items-center gap-2 rounded-md bg-pine px-5 py-2 text-[13px] font-bold text-lime transition hover:bg-pine-deep active:scale-[0.98]">
                <Ic name="check" size={14} sw={2.6} /> Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
