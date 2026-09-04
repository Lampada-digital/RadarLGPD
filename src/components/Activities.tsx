import { useMemo, useState } from "react";
import { useStore } from "../store";
import { AREAS, BASES_ART7, BASES_ART11, CATEGORIAS_DADOS, MEDIDAS, SUJEITOS, TODAS_BASES, fmtData, uid, ZONA_META, zonaRisco } from "../types";
import type { Atividade } from "../types";
import { analisar } from "../ai";
import { Cabecalho, Campo, ChipToggle, Ic, inputCls, Modal, Reveal } from "./ui";

const VAZIA: Atividade = {
  id: "", nome: "", area: "RH", responsavel: "", finalidade: "", baseLegalId: "consentimento",
  sujeitos: [], dados: [], retencao: "", retencaoJustificativa: "", compartilhamento: [],
  transferenciaInternacional: false, medidas: [], probabilidade: 3, impacto: 3,
  origem: "manual", criadoEm: "", observacoes: "",
};

function RiscoChip({ p, i }: { p: number; i: number }) {
  const s = p * i;
  const z = ZONA_META[zonaRisco(s)];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold" style={{ background: z.bg, color: z.fg }}>
      <span className="size-1.5 rounded-full" style={{ background: z.dot }} />
      {z.label} · {s}
    </span>
  );
}

export default function Activities({ buscaInicial = "" }: { buscaInicial?: string }) {
  const { atividades, addAtividade, updateAtividade, removeAtividade, toast } = useStore();
  const [busca, setBusca] = useState(buscaInicial);
  const [fArea, setFArea] = useState("");
  const [fZona, setFZona] = useState("");
  const [fBase, setFBase] = useState("");
  const [form, setForm] = useState<Atividade | null>(null);
  const [editando, setEditando] = useState(false);
  const [novoCompart, setNovoCompart] = useState("");
  const [confirmando, setConfirmando] = useState<string | null>(null);

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return atividades.filter((a) => {
      if (fArea && a.area !== fArea) return false;
      if (fBase && a.baseLegalId !== fBase) return false;
      if (fZona && zonaRisco(a.probabilidade * a.impacto) !== fZona) return false;
      if (q && ![a.nome, a.finalidade, a.responsavel, a.area].some((v) => v.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [atividades, busca, fArea, fBase, fZona]);

  const abrirNova = () => { setEditando(false); setForm({ ...VAZIA, id: uid(), criadoEm: new Date().toISOString().slice(0, 10) }); };
  const abrirEdicao = (a: Atividade) => { setEditando(true); setForm({ ...a, dados: [...a.dados], sujeitos: [...a.sujeitos], medidas: [...a.medidas], compartilhamento: [...a.compartilhamento] }); };

  const salvar = () => {
    if (!form) return;
    if (!form.nome.trim() || !form.finalidade.trim()) {
      toast("Preencha ao menos o nome e a finalidade da atividade.", "warn");
      return;
    }
    if (editando) {
      updateAtividade(form);
      toast("Registro de tratamento atualizado.");
    } else {
      addAtividade({ ...form, origem: "manual" });
      toast("Atividade mapeada no registro (art. 37).");
    }
    setForm(null);
  };

  const autoIA = () => {
    if (!form) return;
    if (!form.finalidade.trim() && !form.nome.trim()) {
      toast("Descreva a finalidade (ou o nome) para a IA classificar.", "warn");
      return;
    }
    const a = analisar(form.finalidade || form.nome);
    setForm({
      ...form,
      dados: [...new Set([...form.dados, ...a.dados])],
      sujeitos: [...new Set([...form.sujeitos, ...a.sujeitos])],
      baseLegalId: a.baseRecomendada,
      retencao: form.retencao || a.retencao,
      retencaoJustificativa: form.retencaoJustificativa || a.retencaoJustificativa,
      medidas: [...new Set([...form.medidas, ...a.medidas])],
      probabilidade: a.probabilidade,
      impacto: a.impacto,
      transferenciaInternacional: form.transferenciaInternacional || a.transferenciaInternacional,
    });
    toast(`IA classificou: ${a.dados.length} dados, base ${TODAS_BASES.find((b) => b.id === a.baseRecomendada)?.inciso}, risco ${a.score}/25.`, "ia");
  };

  const toggle = (campo: "dados" | "sujeitos" | "medidas", v: string) =>
    setForm((f) => (f ? { ...f, [campo]: f[campo].includes(v) ? f[campo].filter((x) => x !== v) : [...f[campo], v] } : f));

  const sensCount = form?.dados.filter((d) => CATEGORIAS_DADOS.find((c) => c.id === d)?.sensivel).length ?? 0;

  return (
    <div>
      <Cabecalho
        kicker="Registro de operações · Art. 37"
        titulo="Atividades de tratamento"
        desc="Inventário completo das operações com dados pessoais: finalidade, base legal, categorias de dados, retenção, compartilhamento e risco."
        acao={
          <button onClick={abrirNova} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2.5 text-[13px] font-bold text-lime shadow-sm transition hover:bg-pine-deep active:scale-[0.98]">
            <Ic name="plus" size={14} sw={2.6} /> Nova atividade
          </button>
        }
      />

      {/* filtros */}
      <Reveal>
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px] flex-1">
            <Ic name="search" size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint" />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, finalidade, responsável…" className={`${inputCls} pl-9`} />
          </div>
          <select value={fArea} onChange={(e) => setFArea(e.target.value)} className={`${inputCls} w-auto`}>
            <option value="">Todas as áreas</option>
            {AREAS.map((a) => <option key={a}>{a}</option>)}
          </select>
          <select value={fZona} onChange={(e) => setFZona(e.target.value)} className={`${inputCls} w-auto`}>
            <option value="">Todo risco</option>
            <option value="baixo">Baixo</option><option value="moderado">Moderado</option><option value="alto">Alto</option><option value="critico">Crítico</option>
          </select>
          <select value={fBase} onChange={(e) => setFBase(e.target.value)} className={`${inputCls} w-auto max-w-[220px]`}>
            <option value="">Todas as bases</option>
            {TODAS_BASES.map((b) => <option key={b.id} value={b.id}>{b.inciso} — {b.titulo}</option>)}
          </select>
          <span className="ml-auto text-[12px] font-semibold text-ink-faint">{filtradas.length} de {atividades.length} registros</span>
        </div>
      </Reveal>

      {/* livro de registros */}
      <div className="overflow-hidden rounded-lg border border-sand bg-cream">
        <div className="hidden grid-cols-[1fr_130px_150px_110px_90px_84px] items-center gap-3 border-b border-sand bg-paper px-4 py-2.5 text-[10px] font-bold tracking-[0.12em] text-ink-faint uppercase lg:grid">
          <span>Atividade / Finalidade</span><span>Área</span><span>Base legal</span><span>Retenção</span><span>Risco</span><span className="text-right">Ações</span>
        </div>
        {filtradas.length === 0 && (
          <div className="px-6 py-14 text-center">
            <Ic name="layers" size={30} className="mx-auto text-sand" />
            <p className="font-display mt-3 text-[16px] font-bold text-ink">Nenhum registro encontrado</p>
            <p className="mt-1 text-[12.5px] text-ink-soft">Ajuste os filtros ou classifique uma nova operação com a IA.</p>
          </div>
        )}
        <ul>
          {filtradas.map((a, i) => {
            const base = TODAS_BASES.find((b) => b.id === a.baseLegalId);
            const z = zonaRisco(a.probabilidade * a.impacto);
            const sensivel = a.dados.some((d) => CATEGORIAS_DADOS.find((c) => c.id === d)?.sensivel);
            return (
              <Reveal key={a.id} delay={Math.min(i * 40, 240)}>
                <li className="group grid grid-cols-1 gap-2.5 border-b border-sand/70 px-4 py-3.5 transition-colors last:border-b-0 hover:bg-paper lg:grid-cols-[1fr_130px_150px_110px_90px_84px] lg:items-center lg:gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-[14px] font-bold text-ink">{a.nome}</p>
                      {sensivel && (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-rust/10 px-1.5 py-0.5 text-[9.5px] font-extrabold tracking-wide text-rust uppercase"><Ic name="alert" size={9} sw={2.6} /> Sensível</span>
                      )}
                      {a.origem === "ia" && (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-lime-soft px-1.5 py-0.5 text-[9.5px] font-extrabold tracking-wide text-pine uppercase"><Ic name="spark" size={9} sw={2.6} /> IA</span>
                      )}
                      {a.transferenciaInternacional && (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-paper-deep px-1.5 py-0.5 text-[9.5px] font-extrabold tracking-wide text-ink-soft uppercase"><Ic name="globe" size={9} sw={2.4} /> Intl</span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-ink-soft">{a.finalidade}</p>
                    <p className="mt-1 text-[10.5px] text-ink-faint">{a.sujeitos.join(" · ")} · {a.dados.length} categorias de dados · {fmtData(a.criadoEm)}</p>
                  </div>
                  <div><span className="rounded-md bg-paper-deep px-2 py-1 text-[11.5px] font-bold text-ink-soft">{a.area}</span></div>
                  <div>
                    <p className="text-[10.5px] font-bold text-moss">{base?.inciso}</p>
                    <p className="truncate text-[11.5px] text-ink-soft">{base?.titulo}</p>
                  </div>
                  <div className="text-[11.5px] leading-snug text-ink-soft">{a.retencao || "—"}</div>
                  <div><RiscoChip p={a.probabilidade} i={a.impacto} /></div>
                  <div className="flex justify-start gap-1.5 lg:justify-end">
                    {confirmando === a.id ? (
                      <>
                        <button
                          onClick={() => { removeAtividade(a.id); setConfirmando(null); toast("Registro excluído do mapa de dados.", "warn"); }}
                          className="rounded-md bg-rust px-2.5 py-1.5 text-[11px] font-bold text-cream transition hover:opacity-90"
                        >Confirmar</button>
                        <button onClick={() => setConfirmando(null)} className="rounded-md border border-sand px-2 py-1.5 text-[11px] font-semibold text-ink-soft">Não</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => abrirEdicao(a)} className="rounded-md border border-sand p-1.5 text-ink-soft transition hover:border-moss hover:bg-moss/10 hover:text-moss" aria-label="Editar">
                          <Ic name="pencil" size={14} />
                        </button>
                        <button onClick={() => setConfirmando(a.id)} className="rounded-md border border-sand p-1.5 text-ink-soft transition hover:border-rust hover:bg-rust/10 hover:text-rust" aria-label="Excluir">
                          <Ic name="trash" size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              </Reveal>
            );
          })}
        </ul>
      </div>

      {/* formulário */}
      <Modal aberto={!!form} onFechar={() => setForm(null)} titulo={editando ? "Editar atividade de tratamento" : "Nova atividade de tratamento"} largura="max-w-3xl">
        {form && (
          <div className="space-y-4">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Campo label="Nome da atividade"><input className={inputCls} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Folha de pagamento" /></Campo>
              <div className="grid grid-cols-2 gap-2.5">
                <Campo label="Área">
                  <select className={inputCls} value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select>
                </Campo>
                <Campo label="Responsável"><input className={inputCls} value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} placeholder="DPO / gestor" /></Campo>
              </div>
            </div>

            <Campo label="Finalidade do tratamento" hint="seja específico — art. 9º, I">
              <div className="relative">
                <textarea className={`${inputCls} min-h-[74px] resize-y pr-28`} value={form.finalidade} onChange={(e) => setForm({ ...form, finalidade: e.target.value })} placeholder="Por que esses dados são tratados? Ex.: processar a folha mensal e cumprir obrigações trabalhistas…" />
                <button type="button" onClick={autoIA} className="absolute right-2 bottom-2 inline-flex items-center gap-1.5 rounded-md bg-pine px-2.5 py-1.5 text-[11px] font-bold text-lime transition hover:bg-pine-deep active:scale-95">
                  <Ic name="spark" size={12} sw={2.4} /> Auto IA
                </button>
              </div>
            </Campo>

            <Campo label={`Titulares (${form.sujeitos.length})`}>
              <div className="flex flex-wrap gap-1.5">{SUJEITOS.map((s) => <ChipToggle key={s} ativo={form.sujeitos.includes(s)} onClick={() => toggle("sujeitos", s)}>{s}</ChipToggle>)}</div>
            </Campo>

            <Campo label={`Categorias de dados pessoais (${form.dados.length})`} hint={sensCount ? `${sensCount} sensível(is) — art. 11` : undefined}>
              <div className="grid grid-cols-1 gap-1.5 rounded-md border border-sand bg-paper p-2.5 sm:grid-cols-2">
                {CATEGORIAS_DADOS.map((c) => (
                  <ChipToggle key={c.id} ativo={form.dados.includes(c.id)} onClick={() => toggle("dados", c.id)} sensivel={c.sensivel}>
                    {c.label}{c.sensivel && " · sensível"}
                  </ChipToggle>
                ))}
              </div>
            </Campo>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <Campo label="Base legal" hint={form.baseLegalId && TODAS_BASES.find((b) => b.id === form.baseLegalId)?.artigo === "art11" ? "dado sensível" : "art. 7º"}>
                <select className={inputCls} value={form.baseLegalId} onChange={(e) => setForm({ ...form, baseLegalId: e.target.value })}>
                  <optgroup label="Dados pessoais — Art. 7º">{BASES_ART7.map((b) => <option key={b.id} value={b.id}>{b.inciso} — {b.titulo}</option>)}</optgroup>
                  <optgroup label="Dados sensíveis — Art. 11">{BASES_ART11.map((b) => <option key={b.id} value={b.id}>{b.inciso} — {b.titulo}</option>)}</optgroup>
                </select>
              </Campo>
              <div className="grid grid-cols-2 gap-2.5">
                <Campo label="Prazo de retenção"><input className={inputCls} value={form.retencao} onChange={(e) => setForm({ ...form, retencao: e.target.value })} placeholder="Ex.: 5 anos" /></Campo>
                <Campo label="Justificativa"><input className={inputCls} value={form.retencaoJustificativa} onChange={(e) => setForm({ ...form, retencaoJustificativa: e.target.value })} placeholder="Ex.: prescrição" /></Campo>
              </div>
            </div>

            <Campo label="Compartilhamento com terceiros" hint="operadores e órgãos">
              <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-sand bg-cream p-2">
                {form.compartilhamento.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1.5 rounded-md bg-paper-deep px-2 py-1 text-[11.5px] font-semibold text-ink-soft">
                    {c}
                    <button onClick={() => setForm({ ...form, compartilhamento: form.compartilhamento.filter((x) => x !== c) })} className="text-ink-faint hover:text-rust"><Ic name="x" size={10} sw={2.6} /></button>
                  </span>
                ))}
                <input
                  value={novoCompart}
                  onChange={(e) => setNovoCompart(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && novoCompart.trim()) { e.preventDefault(); setForm({ ...form, compartilhamento: [...form.compartilhamento, novoCompart.trim()] }); setNovoCompart(""); } }}
                  placeholder="Digite e pressione Enter…"
                  className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-[12.5px] outline-none placeholder:text-ink-faint"
                />
              </div>
            </Campo>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-md border border-sand bg-paper px-3.5 py-3">
              <label className="flex cursor-pointer items-center gap-2.5">
                <button type="button" onClick={() => setForm({ ...form, transferenciaInternacional: !form.transferenciaInternacional })} className={`relative h-5.5 w-10 rounded-full transition-colors ${form.transferenciaInternacional ? "bg-moss" : "bg-sand"}`} aria-label="Transferência internacional">
                  <span className={`absolute top-0.5 size-4.5 rounded-full bg-cream shadow transition-all ${form.transferenciaInternacional ? "left-5" : "left-0.5"}`} />
                </button>
                <span className="text-[12.5px] font-semibold text-ink">Transferência internacional <span className="font-normal text-ink-faint">(art. 33)</span></span>
              </label>
              <div className="flex items-center gap-2 text-[12px] text-ink-soft">
                <span>Risco:</span><RiscoChip p={form.probabilidade} i={form.impacto} />
              </div>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <Campo label={`Probabilidade · ${form.probabilidade}/5`}>
                <input type="range" min={1} max={5} value={form.probabilidade} onChange={(e) => setForm({ ...form, probabilidade: +e.target.value })} className="w-full" />
              </Campo>
              <Campo label={`Impacto · ${form.impacto}/5`}>
                <input type="range" min={1} max={5} value={form.impacto} onChange={(e) => setForm({ ...form, impacto: +e.target.value })} className="w-full" />
              </Campo>
            </div>

            <Campo label={`Medidas de segurança (${form.medidas.length})`}>
              <div className="flex flex-wrap gap-1.5">{MEDIDAS.map((m) => <ChipToggle key={m} ativo={form.medidas.includes(m)} onClick={() => toggle("medidas", m)}>{m}</ChipToggle>)}</div>
            </Campo>

            <Campo label="Observações">
              <textarea className={`${inputCls} min-h-[56px] resize-y`} value={form.observacoes ?? ""} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Notas do Encarregado, links para RIPD, contratos…" />
            </Campo>

            <div className="flex items-center justify-end gap-2.5 border-t border-sand pt-4">
              <button onClick={() => setForm(null)} className="rounded-md border border-sand px-4 py-2 text-[13px] font-semibold text-ink-soft transition hover:bg-paper">Cancelar</button>
              <button onClick={salvar} className="inline-flex items-center gap-2 rounded-md bg-pine px-5 py-2 text-[13px] font-bold text-lime transition hover:bg-pine-deep active:scale-[0.98]">
                <Ic name="check" size={14} sw={2.6} /> {editando ? "Salvar alterações" : "Adicionar ao registro"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
