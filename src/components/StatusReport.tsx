import { useState } from "react";
import { useStore } from "../store";
import { Cabecalho, Ic, Reveal } from "./ui";
import { uid } from "../domain";

/* =====================================================================
   Status Report — Acompanhamento de projetos e iniciativas de GRC
   ===================================================================== */

interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  responsavel: string;
  dataInicio: string;
  dataFim: string;
  status: "planejado" | "em_andamento" | "concluido" | "atrasado" | "pausado";
  progresso: number;
  marco: string;
  riscos: string[];
  proximosPassos: string[];
}

const SEED_PROJETOS: Projeto[] = [
  {
    id: "p1",
    nome: "Implementação ISO 27001",
    descricao: "Implementação completa do Sistema de Gestão de Segurança da Informação",
    responsavel: "João Silva",
    dataInicio: "2026-01-01",
    dataFim: "2026-06-30",
    status: "em_andamento",
    progresso: 65,
    marco: "Auditoria interna concluída",
    riscos: ["Atraso na documentação de políticas", "Falta de engajamento de algumas áreas"],
    proximosPassos: ["Realizar auditoria interna", "Corrigir não conformidades", "Preparar documentação para certificação"],
  },
  {
    id: "p2",
    nome: "Adequação LGPD",
    descricao: "Adequação completa à Lei Geral de Proteção de Dados",
    responsavel: "Maria Santos",
    dataInicio: "2025-11-01",
    dataFim: "2026-03-31",
    status: "em_andamento",
    progresso: 80,
    marco: "Mapeamento de dados concluído",
    riscos: ["Necessidade de treinamento adicional", "Revisão de contratos com operadores"],
    proximosPassos: ["Implementar políticas de privacidade", "Treinar colaboradores", "Revisar contratos"],
  },
  {
    id: "p3",
    nome: "Certificação SOC 2 Type II",
    descricao: "Obtenção da certificação SOC 2 Type II",
    responsavel: "Pedro Costa",
    dataInicio: "2026-02-01",
    dataFim: "2026-08-31",
    status: "planejado",
    progresso: 20,
    marco: "Definição de escopo e critérios",
    riscos: ["Complexidade dos controles", "Necessidade de evidências robustas"],
    proximosPassos: ["Definir escopo", "Mapear controles existentes", "Identificar gaps"],
  },
  {
    id: "p4",
    nome: "Programa de Gestão de Riscos",
    descricao: "Implementação de programa corporativo de gestão de riscos",
    responsavel: "Ana Oliveira",
    dataInicio: "2025-09-01",
    dataFim: "2026-02-28",
    status: "concluido",
    progresso: 100,
    marco: "Programa operacional",
    riscos: [],
    proximosPassos: [],
  },
];

const COR_STATUS = {
  planejado: "bg-paper-deep text-ink-faint",
  em_andamento: "bg-amber-soft text-ink",
  concluido: "bg-moss/12 text-moss",
  atrasado: "bg-rust-soft text-rust",
  pausado: "bg-paper-deep text-ink-soft",
};

export default function StatusReport() {
  const { toast, registrar } = useStore();
  const [projetos, setProjetos] = useState<Projeto[]>(SEED_PROJETOS);
  const [filtro, setFiltro] = useState<string>("todos");
  const [selecionado, setSelecionado] = useState<Projeto | null>(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<Partial<Projeto>>({});

  const filtrados = projetos.filter((p) => filtro === "todos" || p.status === filtro);

  const stats = {
    total: projetos.length,
    em_andamento: projetos.filter((p) => p.status === "em_andamento").length,
    concluidos: projetos.filter((p) => p.status === "concluido").length,
    atrasados: projetos.filter((p) => p.status === "atrasado").length,
  };

  const atualizarProjeto = (id: string, patch: Partial<Projeto>) => {
    setProjetos((l) => l.map((p) => p.id === id ? { ...p, ...patch } : p));
    registrar("status-report", `Projeto ${id} atualizado.`);
    toast("Projeto atualizado.");
  };

  const criarProjeto = () => {
    if (!form.nome || !form.responsavel) {
      toast("Preencha nome e responsável.", "warn");
      return;
    }
    const novo: Projeto = {
      id: uid(),
      nome: form.nome ?? "",
      descricao: form.descricao ?? "",
      responsavel: form.responsavel ?? "",
      dataInicio: form.dataInicio ?? new Date().toISOString().slice(0, 10),
      dataFim: form.dataFim ?? "",
      status: "planejado",
      progresso: 0,
      marco: form.marco ?? "",
      riscos: [],
      proximosPassos: [],
    };
    setProjetos((l) => [novo, ...l]);
    registrar("status-report", `Novo projeto criado: ${novo.nome}`);
    toast("Projeto criado com sucesso.");
    setEditando(false);
    setForm({});
  };

  const excluirProjeto = (id: string) => {
    setProjetos((l) => l.filter((p) => p.id !== id));
    registrar("status-report", `Projeto ${id} excluído.`);
    toast("Projeto excluído.");
  };

  return (
    <div>
      <Cabecalho
        kicker="Gestão · acompanhamento de projetos"
        titulo="Status Report"
        desc="Acompanhamento do status de projetos e iniciativas de GRC, com métricas de progresso, marcos e próximos passos."
        acao={
          <button onClick={() => { setEditando(true); setForm({}); }} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2.5 text-[13px] font-bold text-lime shadow-sm transition hover:bg-pine-deep active:scale-[0.98]">
            <Ic name="plus" size={14} sw={2.6} /> Novo Projeto
          </button>
        }
      />

      <Reveal>
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { l: "Total de Projetos", v: stats.total, cor: "text-ink" },
            { l: "Em Andamento", v: stats.em_andamento, cor: "text-amber" },
            { l: "Concluídos", v: stats.concluidos, cor: "text-moss" },
            { l: "Atrasados", v: stats.atrasados, cor: "text-rust" },
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
          {(["todos", "planejado", "em_andamento", "concluido", "atrasado", "pausado"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`rounded-md border px-3 py-1.5 text-[11px] font-bold uppercase transition ${filtro === f ? "border-pine bg-pine text-lime" : "border-sand bg-cream text-ink-soft hover:border-moss"}`}
            >
              {f === "todos" ? "Todos" : f.replace("_", " ")}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="rounded-lg border border-sand bg-cream">
            <div className="border-b border-sand bg-paper px-4 py-3">
              <h2 className="font-display text-[14px] font-bold text-ink">Projetos</h2>
            </div>
            <ul className="divide-y divide-sand/60">
              {filtrados.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => setSelecionado(p)}
                    className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-paper ${selecionado?.id === p.id ? "bg-moss/8" : ""}`}
                  >
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${COR_STATUS[p.status]}`}>{p.status.replace("_", " ")}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-bold text-ink">{p.nome}</p>
                      <p className="text-[10.5px] text-ink-faint">{p.responsavel} · {p.dataInicio}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-paper-deep">
                        <div className="h-full rounded-full bg-moss" style={{ width: `${p.progresso}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-ink-soft">{p.progresso}%</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={80}>
          {selecionado ? (
            <div className="rounded-lg border border-sand bg-cream p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[18px] font-bold text-ink">{selecionado.nome}</p>
                  <p className="mt-0.5 text-[12px] text-ink-soft">{selecionado.descricao}</p>
                  <p className="mt-1 text-[10.5px] text-ink-faint">Responsável: {selecionado.responsavel} · {selecionado.dataInicio} → {selecionado.dataFim}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditando(true); setForm(selecionado); }} className="rounded-md border border-sand p-1.5 text-ink-soft transition hover:border-moss hover:text-moss" title="Editar">
                    <Ic name="pencil" size={14} />
                  </button>
                  <button onClick={() => excluirProjeto(selecionado.id)} className="rounded-md border border-sand p-1.5 text-ink-soft transition hover:border-rust hover:text-rust" title="Excluir">
                    <Ic name="trash" size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-bold text-ink-soft uppercase">Progresso</p>
                  <p className="font-display text-[14px] font-bold text-moss">{selecionado.progresso}%</p>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-paper-deep">
                  <div className="h-full rounded-full bg-moss transition-all" style={{ width: `${selecionado.progresso}%` }} />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-display mb-2 text-[13px] font-bold text-ink">Marco Atual</h3>
                <p className="rounded-md border border-moss/40 bg-moss/8 px-3 py-2 text-[12px] font-semibold text-moss">{selecionado.marco}</p>
              </div>

              {selecionado.riscos.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-display mb-2 text-[13px] font-bold text-ink">Riscos</h3>
                  <ul className="space-y-1.5">
                    {selecionado.riscos.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-ink-soft">
                        <Ic name="alert" size={13} sw={2.4} className="mt-0.5 shrink-0 text-amber" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selecionado.proximosPassos.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-display mb-2 text-[13px] font-bold text-ink">Próximos Passos</h3>
                  <ul className="space-y-1.5">
                    {selecionado.proximosPassos.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-ink-soft">
                        <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-moss/12 text-moss text-[9px] font-bold">{i + 1}</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-sand bg-paper/60 px-6 py-14 text-center">
              <div>
                <Ic name="doc" size={30} className="mx-auto text-sand" />
                <p className="font-display mt-3 text-[16px] font-bold text-ink">Selecione um projeto</p>
                <p className="mt-1 text-[12.5px] text-ink-soft">Veja detalhes, progresso e próximos passos.</p>
              </div>
            </div>
          )}
        </Reveal>
      </div>

      {/* Modal de edição */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pine-deep/60 p-4" onClick={() => setEditando(false)}>
          <div className="anim-pop w-full max-w-2xl rounded-lg border border-sand bg-cream p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display mb-4 text-[18px] font-bold text-ink">{form.id ? "Editar" : "Novo"} Projeto</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Nome</span>
                <input className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={form.nome ?? ""} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Descrição</span>
                <textarea className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" rows={2} value={form.descricao ?? ""} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Responsável</span>
                <input className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={form.responsavel ?? ""} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Progresso (%)</span>
                <input type="number" min="0" max="100" className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={form.progresso ?? 0} onChange={(e) => setForm({ ...form, progresso: parseInt(e.target.value) })} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Data Início</span>
                <input type="date" className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={form.dataInicio ?? ""} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Data Fim</span>
                <input type="date" className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={form.dataFim ?? ""} onChange={(e) => setForm({ ...form, dataFim: e.target.value })} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Marco Atual</span>
                <input className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={form.marco ?? ""} onChange={(e) => setForm({ ...form, marco: e.target.value })} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Status</span>
                <select className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={form.status ?? "planejado"} onChange={(e) => setForm({ ...form, status: e.target.value as Projeto["status"] })}>
                  <option value="planejado">Planejado</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluido">Concluído</option>
                  <option value="atrasado">Atrasado</option>
                  <option value="pausado">Pausado</option>
                </select>
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEditando(false)} className="rounded-md border border-sand px-4 py-2 text-[13px] font-semibold text-ink-soft transition hover:bg-paper">Cancelar</button>
              <button onClick={() => { if (form.id) atualizarProjeto(form.id, form); else criarProjeto(); setEditando(false); }} className="inline-flex items-center gap-2 rounded-md bg-pine px-5 py-2 text-[13px] font-bold text-lime transition hover:bg-pine-deep active:scale-[0.98]">
                <Ic name="check" size={14} sw={2.6} /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
