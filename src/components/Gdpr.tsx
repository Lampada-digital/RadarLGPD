import { useMemo, useRef, useState } from "react";
import { useStore } from "../store";
import { BASES_ART6, BASES_ART9, CRITERIOS_DPIA, DADOS_GDPR, MECANISMOS_TRANSFERENCIA, TITULARES_GDPR, TODAS_BASES_GDPR } from "../gdpr";
import type { GdprAtividade } from "../gdpr";
import { fmtData, uid } from "../types";
import { analisarGdpr } from "../aiExtra";
import { baixarModelo, importarGdpr, MODELO_GDPR, parseCsv } from "../importCsv";
import { Cabecalho, Campo, ChipToggle, Ic, inputCls, Modal, Reveal } from "./ui";

const MEDIDAS_GDPR = [
  "Criptografia em trânsito (TLS 1.2+)",
  "Criptografia em repouso",
  "Pseudonimização (Art. 25)",
  "Anonimização",
  "Controle de acesso (RBAC)",
  "Autenticação multifator (MFA)",
  "Registro de auditoria (logs)",
  "Consent management platform",
  "LIA documentada",
  "DPIA concluída (Art. 35)",
  "Acordos com processors (Art. 28)",
  "Transfer Impact Assessment (TIA)",
];

const RISCO_META = {
  1: { label: "Baixo", bg: "#dfe9cf", fg: "#3c5a2a", dot: "#6f9a45" },
  2: { label: "Médio", bg: "#f0e5bd", fg: "#7a5f14", dot: "#d9a726" },
  3: { label: "Alto", bg: "#ecc6b4", fg: "#8c3013", dot: "#bd4f26" },
} as const;

const STATUS_TF = {
  vigente: { label: "Vigente", cls: "bg-moss/12 text-moss" },
  em_revisao: { label: "Em revisão", cls: "bg-amber-soft text-ink" },
  pendente: { label: "Pendente", cls: "bg-rust-soft text-rust" },
} as const;

const VAZIA: GdprAtividade = {
  id: "", nome: "", departamento: "HR", finalidades: "", baseArt6: "gdpr-legitimo", baseArt9: undefined,
  titulares: [], dados: [], retencao: "", destinatarios: [], transferencia: false, mecanismoTransferencia: undefined,
  medidas: [], risco: 2, origem: "manual", criadoEm: "", observacoes: "",
};

function baseLabel(id?: string) {
  const b = TODAS_BASES_GDPR.find((x) => x.id === id);
  return b ? `${b.ref} — ${b.titulo}` : "—";
}

/* ================= ROPA (Art. 30) ================= */

function Ropa() {
  const { gdprAtividades, addGdprAtividade, updateGdprAtividade, removeGdprAtividade, toast, registrar } = useStore();
  const importRef = useRef<HTMLInputElement>(null);
  const [busca, setBusca] = useState("");
  const [fBase, setFBase] = useState("");
  const [form, setForm] = useState<GdprAtividade | null>(null);
  const [editando, setEditando] = useState(false);
  const [novoDest, setNovoDest] = useState("");
  const [confirmando, setConfirmando] = useState<string | null>(null);

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return gdprAtividades.filter((a) => {
      if (fBase && a.baseArt6 !== fBase && a.baseArt9 !== fBase) return false;
      if (q && ![a.nome, a.finalidades, a.departamento].some((v) => v.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [gdprAtividades, busca, fBase]);

  const abrirNova = () => { setEditando(false); setForm({ ...VAZIA, id: uid(), criadoEm: new Date().toISOString().slice(0, 10) }); };
  const abrirEdicao = (a: GdprAtividade) => {
    setEditando(true);
    setForm({ ...a, titulares: [...a.titulares], dados: [...a.dados], destinatarios: [...a.destinatarios], medidas: [...a.medidas] });
  };

  const salvar = () => {
    if (!form) return;
    if (!form.nome.trim() || !form.finalidades.trim()) {
      toast("Preencha o nome e as finalidades (purpose) da operação.", "warn");
      return;
    }
    if (editando) {
      updateGdprAtividade(form);
      toast("Registro do Art. 30 atualizado.");
    } else {
      addGdprAtividade({ ...form, origem: "manual" });
      toast(`Operação registrada no ROPA — nível de risco atualizado: ${RISCO_META[form.risco].label}.`);
    }
    setForm(null);
  };

  /* ---------- importação de planilha → alimenta o ROPA automaticamente ---------- */
  const importarArquivo = async (file: File | undefined) => {
    if (!file) return;
    try {
      const texto = await file.text();
      const linhas = parseCsv(texto);
      const { itens, erros } = importarGdpr(linhas);
      itens.forEach((a) => addGdprAtividade(a));
      if (itens.length) {
        const alto = itens.filter((a) => a.risco === 3).length;
        registrar("sistema", `Importação de planilha: ${itens.length} operação(ões) GDPR adicionada(s) de "${file.name}".`);
        toast(`Importadas ${itens.length} operação(ões) para o ROPA${alto ? ` — ${alto} de risco alto` : ""}.`);
      } else {
        toast("Nenhuma linha válida encontrada na planilha.", "warn");
      }
      erros.slice(0, 3).forEach((e) => toast(e, "warn"));
    } catch {
      toast("Não foi possível ler o arquivo. Use CSV exportado do Excel/Google Sheets.", "warn");
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  };

  const autoIA = () => {
    if (!form) return;
    if (!form.finalidades.trim() && !form.nome.trim()) {
      toast("Descreva as finalidades para a IA classificar (em PT ou EN).", "warn");
      return;
    }
    const a = analisarGdpr(form.finalidades || form.nome);
    setForm({
      ...form,
      dados: [...new Set([...form.dados, ...a.dados])],
      titulares: [...new Set([...form.titulares, ...a.titulares])],
      baseArt6: a.baseArt6,
      baseArt9: a.baseArt9 ?? form.baseArt9,
      retencao: form.retencao || a.retencao,
      destinatarios: [...new Set([...form.destinatarios, ...a.destinatarios])],
      transferencia: form.transferencia || a.transferencia,
      mecanismoTransferencia: form.mecanismoTransferencia ?? a.mecanismoSugerido,
      medidas: [...new Set([...form.medidas, ...a.medidas])],
      risco: a.risco,
    });
    toast(`IA classificou: ${a.dados.length} categorias, base ${baseLabel(a.baseArt6).split("—")[0].trim()}, risco ${RISCO_META[a.risco].label.toLowerCase()}.`, "ia");
  };

  const toggle = (campo: "dados" | "titulares" | "medidas", v: string) =>
    setForm((f) => (f ? { ...f, [campo]: f[campo].includes(v) ? f[campo].filter((x) => x !== v) : [...f[campo], v] } : f));

  const especiais = form?.dados.filter((d) => DADOS_GDPR.find((x) => x.id === d)?.especial).length ?? 0;

  return (
    <div>
      <Cabecalho
        kicker="GDPR · Registro do Art. 30"
        titulo="ROPA — Records of Processing"
        desc="Registro das atividades de tratamento sob responsabilidade do controller/processor, com bases dos Art. 6 e 9, categorias de dados, destinatários e transferências (Capítulo V)."
        acao={
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => importRef.current?.click()} className="inline-flex items-center gap-2 rounded-md border border-sand bg-cream px-3.5 py-2.5 text-[12.5px] font-bold text-ink-soft shadow-sm transition hover:border-moss hover:text-moss active:scale-[0.98]">
              <Ic name="download" size={14} className="rotate-180" /> Importar planilha
            </button>
            <button onClick={() => baixarModelo("modelo-ropa-gdpr.csv", MODELO_GDPR)} className="inline-flex items-center gap-2 rounded-md border border-sand bg-cream px-3.5 py-2.5 text-[12.5px] font-bold text-ink-soft shadow-sm transition hover:border-moss hover:text-moss active:scale-[0.98]">
              <Ic name="doc" size={14} /> Modelo
            </button>
            <button onClick={abrirNova} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2.5 text-[13px] font-bold text-lime shadow-sm transition hover:bg-pine-deep active:scale-[0.98]">
              <Ic name="plus" size={14} sw={2.6} /> Nova operação
            </button>
            <input ref={importRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={(e) => void importarArquivo(e.target.files?.[0])} />
          </div>
        }
      />

      <Reveal>
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px] flex-1">
            <Ic name="search" size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint" />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar operação, finalidade, departamento…" className={`${inputCls} pl-9`} />
          </div>
          <select value={fBase} onChange={(e) => setFBase(e.target.value)} className={`${inputCls} w-auto max-w-[260px]`}>
            <option value="">Todas as bases legais</option>
            <optgroup label="Art. 6 — licitude">{BASES_ART6.map((b) => <option key={b.id} value={b.id}>{b.ref} — {b.titulo}</option>)}</optgroup>
            <optgroup label="Art. 9/10 — categorias especiais">{BASES_ART9.map((b) => <option key={b.id} value={b.id}>{b.ref} — {b.titulo}</option>)}</optgroup>
          </select>
          <span className="ml-auto text-[12px] font-semibold text-ink-faint">{filtradas.length} operação(ões)</span>
        </div>
      </Reveal>

      <div className="overflow-hidden rounded-lg border border-sand bg-cream">
        {filtradas.length === 0 && (
          <div className="px-6 py-14 text-center">
            <Ic name="layers" size={30} className="mx-auto text-sand" />
            <p className="font-display mt-3 text-[16px] font-bold text-ink">Nenhuma operação encontrada</p>
            <p className="mt-1 text-[12.5px] text-ink-soft">Registre a primeira operação de tratamento ou classifique com a IA.</p>
          </div>
        )}
        <ul>
          {filtradas.map((a, i) => {
            const b6 = BASES_ART6.find((b) => b.id === a.baseArt6);
            const b9 = BASES_ART9.find((b) => b.id === a.baseArt9);
            const temEspecial = a.dados.some((d) => DADOS_GDPR.find((x) => x.id === d)?.especial);
            const rm = RISCO_META[a.risco];
            return (
              <Reveal key={a.id} delay={Math.min(i * 40, 240)}>
                <li className="grid grid-cols-1 gap-2.5 border-b border-sand/70 px-4 py-3.5 transition-colors last:border-b-0 hover:bg-paper lg:grid-cols-[1fr_110px_190px_90px_84px] lg:items-center lg:gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-[14px] font-bold text-ink">{a.nome}</p>
                      <span className="rounded-sm bg-[#1f4e8f]/10 px-1.5 py-0.5 text-[9.5px] font-extrabold tracking-wide text-[#1f4e8f] uppercase">GDPR</span>
                      {temEspecial && <span className="inline-flex items-center gap-1 rounded-sm bg-rust/10 px-1.5 py-0.5 text-[9.5px] font-extrabold tracking-wide text-rust uppercase"><Ic name="alert" size={9} sw={2.6} /> Art. 9</span>}
                      {a.transferencia && <span className="inline-flex items-center gap-1 rounded-sm bg-paper-deep px-1.5 py-0.5 text-[9.5px] font-extrabold tracking-wide text-ink-soft uppercase"><Ic name="globe" size={9} sw={2.4} /> Cap. V</span>}
                      {a.origem === "ia" && <span className="inline-flex items-center gap-1 rounded-sm bg-lime-soft px-1.5 py-0.5 text-[9.5px] font-extrabold tracking-wide text-pine uppercase"><Ic name="spark" size={9} sw={2.6} /> IA</span>}
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-ink-soft">{a.finalidades}</p>
                    <p className="mt-1 text-[10.5px] text-ink-faint">{a.titulares.join(" · ")} · {a.dados.length} categorias · {a.destinatarios.length} destinatário(s) · {fmtData(a.criadoEm)}</p>
                  </div>
                  <div><span className="rounded-md bg-paper-deep px-2 py-1 text-[11.5px] font-bold text-ink-soft">{a.departamento}</span></div>
                  <div>
                    <p className="text-[10.5px] font-bold text-[#1f4e8f]">{b6?.ref}</p>
                    <p className="truncate text-[11.5px] text-ink-soft">{b6?.titulo}</p>
                    {b9 && <p className="truncate text-[10.5px] text-rust">{b9.ref} · {b9.titulo}</p>}
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold" style={{ background: rm.bg, color: rm.fg }}>
                      <span className="size-1.5 rounded-full" style={{ background: rm.dot }} /> {rm.label}
                    </span>
                  </div>
                  <div className="flex justify-start gap-1.5 lg:justify-end">
                    {confirmando === a.id ? (
                      <>
                        <button onClick={() => { removeGdprAtividade(a.id); setConfirmando(null); toast("Operação removida do ROPA.", "warn"); }} className="rounded-md bg-rust px-2.5 py-1.5 text-[11px] font-bold text-cream transition hover:opacity-90">Confirmar</button>
                        <button onClick={() => setConfirmando(null)} className="rounded-md border border-sand px-2 py-1.5 text-[11px] font-semibold text-ink-soft">Não</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => abrirEdicao(a)} className="rounded-md border border-sand p-1.5 text-ink-soft transition hover:border-moss hover:bg-moss/10 hover:text-moss" aria-label="Editar"><Ic name="pencil" size={14} /></button>
                        <button onClick={() => setConfirmando(a.id)} className="rounded-md border border-sand p-1.5 text-ink-soft transition hover:border-rust hover:bg-rust/10 hover:text-rust" aria-label="Excluir"><Ic name="trash" size={14} /></button>
                      </>
                    )}
                  </div>
                </li>
              </Reveal>
            );
          })}
        </ul>
      </div>

      <Modal aberto={!!form} onFechar={() => setForm(null)} titulo={editando ? "Editar operação (Art. 30)" : "Nova operação de tratamento (Art. 30)"} largura="max-w-3xl">
        {form && (
          <div className="space-y-4">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Campo label="Nome da operação"><input className={inputCls} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: EU payroll" /></Campo>
              <Campo label="Departamento">
                <select className={inputCls} value={form.departamento} onChange={(e) => setForm({ ...form, departamento: e.target.value })}>
                  {["HR", "Marketing", "Vendas", "Financeiro", "TI", "Jurídico", "Facilities", "Operações", "Atendimento"].map((d) => <option key={d}>{d}</option>)}
                </select>
              </Campo>
            </div>

            <Campo label="Finalidades (purposes)" hint="seja específico — Art. 5(1)(b)">
              <div className="relative">
                <textarea className={`${inputCls} min-h-[74px] resize-y pr-28`} value={form.finalidades} onChange={(e) => setForm({ ...form, finalidades: e.target.value })} placeholder="Descreva o tratamento… (aceita PT ou EN) Ex.: processar a folha mensal e cumprir obrigações legais…" />
                <button type="button" onClick={autoIA} className="absolute right-2 bottom-2 inline-flex items-center gap-1.5 rounded-md bg-pine px-2.5 py-1.5 text-[11px] font-bold text-lime transition hover:bg-pine-deep active:scale-95">
                  <Ic name="spark" size={12} sw={2.4} /> Auto IA
                </button>
              </div>
            </Campo>

            <Campo label={`Titulares (data subjects) (${form.titulares.length})`}>
              <div className="flex flex-wrap gap-1.5">{TITULARES_GDPR.map((s) => <ChipToggle key={s} ativo={form.titulares.includes(s)} onClick={() => toggle("titulares", s)}>{s}</ChipToggle>)}</div>
            </Campo>

            <Campo label={`Categorias de dados (${form.dados.length})`} hint={especiais ? `${especiais} categoria(s) especial(is) — Art. 9` : undefined}>
              <div className="grid grid-cols-1 gap-1.5 rounded-md border border-sand bg-paper p-2.5 sm:grid-cols-2">
                {DADOS_GDPR.map((d) => (
                  <ChipToggle key={d.id} ativo={form.dados.includes(d.id)} onClick={() => toggle("dados", d.id)} sensivel={!!d.especial}>
                    {d.label}{d.especial && " · especial"}
                  </ChipToggle>
                ))}
              </div>
            </Campo>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <Campo label="Base de licitude — Art. 6">
                <select className={inputCls} value={form.baseArt6} onChange={(e) => setForm({ ...form, baseArt6: e.target.value })}>
                  {BASES_ART6.map((b) => <option key={b.id} value={b.id}>{b.ref} — {b.titulo}</option>)}
                </select>
              </Campo>
              <Campo label="Condição Art. 9 / Art. 10" hint="se houver categoria especial">
                <select className={inputCls} value={form.baseArt9 ?? ""} onChange={(e) => setForm({ ...form, baseArt9: e.target.value || undefined })}>
                  <option value="">Não se aplica</option>
                  {BASES_ART9.map((b) => <option key={b.id} value={b.id}>{b.ref} — {b.titulo}</option>)}
                </select>
              </Campo>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <Campo label="Prazo de retenção"><input className={inputCls} value={form.retencao} onChange={(e) => setForm({ ...form, retencao: e.target.value })} placeholder="Ex.: 6 anos após desligamento" /></Campo>
              <Campo label="Risco para direitos e liberdades">
                <div className="grid grid-cols-3 gap-1.5">
                  {([1, 2, 3] as const).map((r) => (
                    <button key={r} type="button" onClick={() => setForm({ ...form, risco: r })} className={`rounded-md border px-2 py-2 text-[12px] font-bold transition ${form.risco === r ? "border-ink shadow-sm" : "border-sand hover:border-ink/40"}`} style={{ background: RISCO_META[r].bg, color: RISCO_META[r].fg }}>
                      {RISCO_META[r].label}
                    </button>
                  ))}
                </div>
              </Campo>
            </div>

            <Campo label="Destinatários (recipients / processors)">
              <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-sand bg-cream p-2">
                {form.destinatarios.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1.5 rounded-md bg-paper-deep px-2 py-1 text-[11.5px] font-semibold text-ink-soft">
                    {c}
                    <button onClick={() => setForm({ ...form, destinatarios: form.destinatarios.filter((x) => x !== c) })} className="text-ink-faint hover:text-rust"><Ic name="x" size={10} sw={2.6} /></button>
                  </span>
                ))}
                <input
                  value={novoDest}
                  onChange={(e) => setNovoDest(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && novoDest.trim()) { e.preventDefault(); setForm({ ...form, destinatarios: [...form.destinatarios, novoDest.trim()] }); setNovoDest(""); } }}
                  placeholder="Digite e pressione Enter…"
                  className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-[12.5px] outline-none placeholder:text-ink-faint"
                />
              </div>
            </Campo>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-md border border-sand bg-paper px-3.5 py-3">
              <label className="flex cursor-pointer items-center gap-2.5">
                <button type="button" onClick={() => setForm({ ...form, transferencia: !form.transferencia })} className={`relative h-5.5 w-10 rounded-full transition-colors ${form.transferencia ? "bg-moss" : "bg-sand"}`} aria-label="Transferência fora do EEE">
                  <span className={`absolute top-0.5 size-4.5 rounded-full bg-cream shadow transition-all ${form.transferencia ? "left-5" : "left-0.5"}`} />
                </button>
                <span className="text-[12.5px] font-semibold text-ink">Transferência para fora do EEE <span className="font-normal text-ink-faint">(Capítulo V)</span></span>
              </label>
              {form.transferencia && (
                <select className={`${inputCls} w-auto max-w-[320px]`} value={form.mecanismoTransferencia ?? ""} onChange={(e) => setForm({ ...form, mecanismoTransferencia: e.target.value || undefined })}>
                  <option value="">Selecione o mecanismo…</option>
                  {MECANISMOS_TRANSFERENCIA.map((m) => <option key={m}>{m}</option>)}
                </select>
              )}
            </div>

            <Campo label={`Medidas técnicas e organizacionais (${form.medidas.length})`}>
              <div className="flex flex-wrap gap-1.5">{MEDIDAS_GDPR.map((m) => <ChipToggle key={m} ativo={form.medidas.includes(m)} onClick={() => toggle("medidas", m)}>{m}</ChipToggle>)}</div>
            </Campo>

            <div className="flex items-center justify-end gap-2.5 border-t border-sand pt-4">
              <button onClick={() => setForm(null)} className="rounded-md border border-sand px-4 py-2 text-[13px] font-semibold text-ink-soft transition hover:bg-paper">Cancelar</button>
              <button onClick={salvar} className="inline-flex items-center gap-2 rounded-md bg-pine px-5 py-2 text-[13px] font-bold text-lime transition hover:bg-pine-deep active:scale-[0.98]">
                <Ic name="check" size={14} sw={2.6} /> {editando ? "Salvar alterações" : "Registrar no Art. 30"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ================= Bases legais GDPR ================= */

function Bases() {
  const { gdprAtividades } = useStore();
  const conta = (id: string) => gdprAtividades.filter((a) => a.baseArt6 === id || a.baseArt9 === id).length;
  return (
    <div>
      <Cabecalho
        kicker="GDPR · Licitude do tratamento"
        titulo="Bases legais — Art. 6, 9 e 10"
        desc="As 6 bases de licitude do Art. 6 e as 10 condições para categorias especiais. Os contadores refletem o uso real no seu ROPA."
      />
      <Reveal>
        <p className="mb-2 text-[11px] font-bold tracking-[0.14em] text-[#1f4e8f] uppercase">Art. 6 — bases de licitude</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BASES_ART6.map((b, i) => {
            const n = conta(b.id);
            return (
              <Reveal key={b.id} delay={i * 50}>
                <div className="group h-full rounded-lg border border-sand bg-cream p-4 transition hover:-translate-y-0.5 hover:border-[#1f4e8f]/50 hover:shadow-[0_12px_28px_-16px_rgba(31,78,143,0.45)]">
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-sm bg-[#1f4e8f]/10 px-1.5 py-0.5 text-[10px] font-extrabold text-[#1f4e8f]">{b.ref}</span>
                    {n > 0 && <span className="font-display text-[15px] font-extrabold text-[#1f4e8f]">{n}×</span>}
                  </div>
                  <p className="font-display mt-2 text-[14px] font-bold text-ink">{b.titulo}</p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{b.descricao}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Reveal>
      <Reveal delay={120}>
        <p className="mt-6 mb-2 text-[11px] font-bold tracking-[0.14em] text-rust uppercase">Art. 9 / Art. 10 — categorias especiais</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BASES_ART9.map((b, i) => {
            const n = conta(b.id);
            return (
              <Reveal key={b.id} delay={i * 40}>
                <div className="h-full rounded-lg border border-rust/25 bg-cream p-4 transition hover:-translate-y-0.5 hover:border-rust/60 hover:shadow-[0_12px_28px_-16px_rgba(189,79,38,0.35)]">
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-sm bg-rust/10 px-1.5 py-0.5 text-[10px] font-extrabold text-rust">{b.ref}</span>
                    {n > 0 && <span className="font-display text-[15px] font-extrabold text-rust">{n}×</span>}
                  </div>
                  <p className="font-display mt-2 text-[14px] font-bold text-ink">{b.titulo}</p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{b.descricao}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Reveal>
    </div>
  );
}

/* ================= DPIA & Transferências ================= */

function Dpia() {
  const { dpiaChecks, toggleDpia, transferencias, addTransferencia, removeTransferencia, toast } = useStore();
  const marcados = Object.values(dpiaChecks).filter(Boolean).length;
  const obrigatoria = marcados >= 2;
  const [destino, setDestino] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [mecanismo, setMecanismo] = useState(MECANISMOS_TRANSFERENCIA[1]);

  const addTf = () => {
    if (!destino.trim() || !destinatario.trim()) {
      toast("Informe o país de destino e o destinatário.", "warn");
      return;
    }
    addTransferencia({ id: uid(), destino: destino.trim(), destinatario: destinatario.trim(), mecanismo, status: "pendente" });
    setDestino("");
    setDestinatario("");
    toast("Transferência registrada — anexe o TIA e as SCCs assinadas.");
  };

  return (
    <div>
      <Cabecalho
        kicker="GDPR · Art. 35 e Capítulo V"
        titulo="DPIA e transferências internacionais"
        desc="Use os 9 critérios do EDPB (WP248) para decidir se a operação exige Data Protection Impact Assessment e gerencie as transferências para fora do EEE."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <div className="rounded-lg border border-sand bg-cream p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[15px] font-bold text-ink">Critérios de obrigatoriedade</h2>
              <span className="font-display text-[13px] font-bold text-moss">{marcados}/9</span>
            </div>
            <ul className="space-y-1.5">
              {CRITERIOS_DPIA.map((cr) => {
                const on = !!dpiaChecks[cr.id];
                return (
                  <li key={cr.id}>
                    <button onClick={() => toggleDpia(cr.id)} className={`flex w-full items-start gap-2.5 rounded-md border px-3 py-2.5 text-left transition-all duration-150 ${on ? "border-[#1f4e8f]/50 bg-[#1f4e8f]/6" : "border-sand bg-paper hover:border-[#1f4e8f]/40"}`}>
                      <span className={`mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-sm border transition ${on ? "border-[#1f4e8f] bg-[#1f4e8f] text-cream" : "border-sand bg-cream"}`}>
                        {on && <Ic name="check" size={10} sw={3} />}
                      </span>
                      <span>
                        <span className={`block text-[12.5px] leading-snug font-semibold ${on ? "text-ink" : "text-ink-soft"}`}>{cr.label}</span>
                        <span className="text-[10px] font-bold tracking-wide text-[#1f4e8f]/70 uppercase">{cr.ref}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className={`mt-4 rounded-md border px-4 py-3.5 ${obrigatoria ? "border-rust/50 bg-rust-soft/40" : "border-moss/40 bg-moss/8"}`}>
              <p className={`flex items-center gap-2 font-display text-[14.5px] font-extrabold ${obrigatoria ? "text-rust" : "text-moss"}`}>
                <Ic name={obrigatoria ? "alert" : "check"} size={16} sw={2.4} />
                {obrigatoria ? "DPIA obrigatória (Art. 35)" : "DPIA não obrigatória"}
              </p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">
                {obrigatoria
                  ? `${marcados} critérios atendidos — o EDPB entende que 2 ou mais indicam alto risco. Conduza a DPIA antes de iniciar o tratamento e consulte a autoridade (Art. 36) se o risco residual persistir.`
                  : "Menos de 2 critérios atendidos. Documente a decisão para fins de accountability (Art. 5(2)) e reavalie se o tratamento mudar."}
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={90}>
          <div className="flex h-full flex-col rounded-lg border border-sand bg-cream p-5">
            <h2 className="font-display mb-1 text-[15px] font-bold text-ink">Transferências para fora do EEE</h2>
            <p className="mb-4 text-[11.5px] text-ink-soft">Capítulo V — cada transferência precisa de um mecanismo adequado do Art. 45–49 e de um TIA pós-Schrems II.</p>
            <ul className="space-y-2">
              {transferencias.map((t) => (
                <li key={t.id} className="group rounded-md border border-sand bg-paper px-3.5 py-3 transition hover:border-moss/45">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-bold text-ink">
                      <span className="mr-1.5 inline-block size-2 rounded-full align-middle" style={{ background: t.status === "vigente" ? "var(--color-moss)" : t.status === "em_revisao" ? "var(--color-amber)" : "var(--color-rust)" }} />
                      {t.destino}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${STATUS_TF[t.status].cls}`}>{STATUS_TF[t.status].label}</span>
                      <button onClick={() => { removeTransferencia(t.id); toast("Transferência removida.", "warn"); }} className="text-ink-faint opacity-0 transition group-hover:opacity-100 hover:text-rust" aria-label="Remover">
                        <Ic name="trash" size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-ink-soft">{t.destinatario}</p>
                  <p className="mt-0.5 text-[10.5px] font-semibold text-[#1f4e8f]">{t.mecanismo}</p>
                </li>
              ))}
              {transferencias.length === 0 && <p className="rounded-md border border-dashed border-sand px-3 py-6 text-center text-[12px] text-ink-faint">Nenhuma transferência registrada.</p>}
            </ul>

            <div className="mt-auto rounded-md border border-sand bg-paper p-3.5 pt-4">
              <p className="mb-2 text-[10.5px] font-bold tracking-[0.12em] text-ink-soft uppercase">Registrar nova transferência</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <input className={inputCls} placeholder="País (ex.: Estados Unidos)" value={destino} onChange={(e) => setDestino(e.target.value)} />
                <input className={inputCls} placeholder="Destinatário (ex.: AWS)" value={destinatario} onChange={(e) => setDestinatario(e.target.value)} />
              </div>
              <select className={`${inputCls} mt-2`} value={mecanismo} onChange={(e) => setMecanismo(e.target.value)}>
                {MECANISMOS_TRANSFERENCIA.map((m) => <option key={m}>{m}</option>)}
              </select>
              <button onClick={addTf} className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-pine px-4 py-2 text-[12.5px] font-bold text-lime transition hover:bg-pine-deep active:scale-[0.99]">
                <Ic name="plus" size={13} sw={2.6} /> Adicionar transferência
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

export default function Gdpr({ view }: { view: "ropa" | "bases" | "dpia" }) {
  return view === "ropa" ? <Ropa /> : view === "bases" ? <Bases /> : <Dpia />;
}
