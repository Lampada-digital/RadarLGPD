import { useMemo, useState } from "react";
import { useStore } from "../store";
import { BASES_ART6, BASES_ART9, DADOS_GDPR, MECANISMOS_TRANSFERENCIA, TITULARES_GDPR, fmtData, uid } from "../domain";
import type { GdprAtividade } from "../domain";
import { Cabecalho, Campo, ChipToggle, Ic, inputCls, Modal, Reveal } from "./ui";

const RISCO_META = {
  1: { label: "Baixo", bg: "#dfe9cf", fg: "#3c5a2a", dot: "#6f9a45" },
  2: { label: "Médio", bg: "#f0e5bd", fg: "#7a5f14", dot: "#d9a726" },
  3: { label: "Alto", bg: "#ecc6b4", fg: "#8c3013", dot: "#bd4f26" },
} as const;

const MEDIDAS_GDPR = ["Criptografia em trânsito (TLS)", "Criptografia em repouso", "Pseudonimização", "Controle de acesso (RBAC)", "Consent management", "LIA documentada", "DPIA (Art. 35)"];

const VAZIA: GdprAtividade = {
  id: "", nome: "", departamento: "HR", finalidades: "", baseArt6: "gdpr-legitimo", baseArt9: undefined,
  titulares: [], dados: [], retencao: "", destinatarios: [], transferencia: false, mecanismoTransferencia: undefined,
  medidas: [], risco: 2, origem: "manual", criadoEm: "",
};

export default function Gdpr({ onUpgrade }: { onUpgrade?: () => void }) {
  const { gdprAtividades, addGdprAtividade, updateGdprAtividade, removeGdprAtividade, toast, registrar, limites } = useStore();
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState<GdprAtividade | null>(null);
  const [editando, setEditando] = useState(false);
  const [novoDest, setNovoDest] = useState("");
  const [confirmando, setConfirmando] = useState<string | null>(null);

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return gdprAtividades.filter((a) => !q || [a.nome, a.finalidades, a.departamento].some((v) => v.toLowerCase().includes(q)));
  }, [gdprAtividades, busca]);

  const abrirNova = () => {
    if (!limites.podeCriar) {
      toast("O trial é somente leitura. Assine um plano para registrar operações.", "warn");
      onUpgrade?.();
      return;
    }
    setEditando(false);
    setForm({ ...VAZIA, id: uid(), criadoEm: new Date().toISOString().slice(0, 10) });
  };

  const salvar = () => {
    if (!form) return;
    if (!form.nome.trim() || !form.finalidades.trim()) {
      toast("Preencha o nome e as finalidades da operação.", "warn");
      return;
    }
    if (editando) {
      updateGdprAtividade(form);
      toast("Registro do Art. 30 atualizado.");
    } else {
      addGdprAtividade({ ...form, origem: "manual" });
      registrar("gdpr", `Operação "${form.nome}" registrada no ROPA (Art. 30).`);
      toast("Operação registrada no ROPA (Art. 30 GDPR).");
    }
    setForm(null);
  };

  const toggle = (campo: "dados" | "titulares" | "medidas", v: string) =>
    setForm((f) => (f ? { ...f, [campo]: f[campo].includes(v) ? f[campo].filter((x) => x !== v) : [...f[campo], v] } : f));

  const especiais = form?.dados.filter((d) => DADOS_GDPR.find((x) => x.id === d)?.sensivel).length ?? 0;

  return (
    <div>
      <Cabecalho
        kicker="GDPR · Registro do Art. 30"
        titulo="ROPA — Records of Processing"
        desc="Registro das atividades de tratamento sob responsabilidade do controller/processor, com bases dos Art. 6 e 9, categorias de dados, destinatários e transferências (Capítulo V)."
        acao={
          <button onClick={abrirNova} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2.5 text-[13px] font-bold text-lime shadow-sm transition hover:bg-pine-deep active:scale-[0.98]">
            <Ic name={limites.podeCriar ? "plus" : "lock"} size={14} sw={2.6} /> Nova operação
          </button>
        }
      />

      {limites.trial && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-amber/60 bg-amber-soft/50 px-4 py-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-amber text-pine"><Ic name="eye" size={15} sw={2.2} /></span>
          <p className="min-w-0 flex-1 text-[12px] leading-snug text-ink-soft">
            <strong className="text-ink">Modo visualização (trial).</strong> Você pode consultar as {gdprAtividades.length} operações de exemplo, mas o registro é liberado com a assinatura.
          </p>
          <button onClick={onUpgrade} className="inline-flex items-center gap-1.5 rounded-md bg-pine px-3.5 py-1.5 text-[11.5px] font-extrabold text-lime transition hover:bg-pine-deep active:scale-[0.98]">
            Desbloquear <Ic name="arrow" size={11} />
          </button>
        </div>
      )}

      <Reveal>
        <div className="relative mb-4">
          <Ic name="search" size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar operação, finalidade, departamento…" className="w-full rounded-md border border-sand bg-cream py-2.5 pr-3 pl-9 text-[13px] text-ink outline-none placeholder:text-ink-faint focus:border-moss focus:ring-2 focus:ring-moss/25" />
        </div>
      </Reveal>

      <div className="overflow-hidden rounded-lg border border-sand bg-cream">
        {filtradas.length === 0 && (
          <div className="px-6 py-14 text-center">
            <Ic name="layers" size={30} className="mx-auto text-sand" />
            <p className="font-display mt-3 text-[16px] font-bold text-ink">Nenhuma operação encontrada</p>
            <p className="mt-1 text-[12.5px] text-ink-soft">Registre a primeira operação de tratamento do ROPA.</p>
          </div>
        )}
        <ul>
          {filtradas.map((a, i) => {
            const b6 = BASES_ART6.find((b) => b.id === a.baseArt6);
            const b9 = BASES_ART9.find((b) => b.id === a.baseArt9);
            const temEspecial = a.dados.some((d) => DADOS_GDPR.find((x) => x.id === d)?.sensivel);
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
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-ink-soft">{a.finalidades}</p>
                    <p className="mt-1 text-[10.5px] text-ink-faint">{a.titulares.join(" · ")} · {a.dados.length} categorias · {fmtData(a.criadoEm)}</p>
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
                        <button onClick={() => { if (!limites.podeCriar) { toast("O trial é somente leitura.", "warn"); return; } setEditando(true); setForm({ ...a, titulares: [...a.titulares], dados: [...a.dados], destinatarios: [...a.destinatarios], medidas: [...a.medidas] }); }} className="rounded-md border border-sand p-1.5 text-ink-soft transition hover:border-moss hover:bg-moss/10 hover:text-moss" aria-label="Editar"><Ic name="pencil" size={14} /></button>
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
                  {["HR", "Marketing", "Vendas", "Financeiro", "TI", "Jurídico", "Operações"].map((d) => <option key={d}>{d}</option>)}
                </select>
              </Campo>
            </div>

            <Campo label="Finalidades (purposes)" hint="específico — Art. 5(1)(b)">
              <textarea className={`${inputCls} min-h-[74px] resize-y`} value={form.finalidades} onChange={(e) => setForm({ ...form, finalidades: e.target.value })} placeholder="Descreva o tratamento… Ex.: processar a folha mensal e cumprir obrigações legais…" />
            </Campo>

            <Campo label={`Titulares (data subjects) (${form.titulares.length})`}>
              <div className="flex flex-wrap gap-1.5">{TITULARES_GDPR.map((s) => <ChipToggle key={s} ativo={form.titulares.includes(s)} onClick={() => toggle("titulares", s)}>{s}</ChipToggle>)}</div>
            </Campo>

            <Campo label={`Categorias de dados (${form.dados.length})`} hint={especiais ? `${especiais} categoria(s) especial(is) — Art. 9` : undefined}>
              <div className="grid grid-cols-1 gap-1.5 rounded-md border border-sand bg-paper p-2.5 sm:grid-cols-2">
                {DADOS_GDPR.map((d) => (
                  <ChipToggle key={d.id} ativo={form.dados.includes(d.id)} onClick={() => toggle("dados", d.id)} sensivel={!!d.sensivel}>
                    {d.label}{d.sensivel && " · especial"}
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
                {form.destinatarios.map((dp) => (
                  <span key={dp} className="inline-flex items-center gap-1.5 rounded-md bg-paper-deep px-2 py-1 text-[11.5px] font-semibold text-ink-soft">
                    {dp}
                    <button onClick={() => setForm({ ...form, destinatarios: form.destinatarios.filter((x) => x !== dp) })} className="text-ink-faint hover:text-rust"><Ic name="x" size={10} sw={2.6} /></button>
                  </span>
                ))}
                <input value={novoDest} onChange={(e) => setNovoDest(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && novoDest.trim()) { e.preventDefault(); setForm({ ...form, destinatarios: [...form.destinatarios, novoDest.trim()] }); setNovoDest(""); } }} placeholder="Digite e pressione Enter…" className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-[12.5px] outline-none placeholder:text-ink-faint" />
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
                <select className="w-auto max-w-[300px] rounded-md border border-sand bg-cream px-3 py-2 text-[13px] outline-none focus:border-moss" value={form.mecanismoTransferencia ?? ""} onChange={(e) => setForm({ ...form, mecanismoTransferencia: e.target.value || undefined })}>
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
