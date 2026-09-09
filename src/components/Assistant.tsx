import { useMemo, useRef, useState } from "react";
import { useStore } from "../store";
import { CATEGORIAS_DADOS, TODAS_BASES, ZONA_META, zonaRisco, uid } from "../domain";
import { analisarLGPD } from "../ai";
import type { AnaliseLGPD } from "../ai";
import { Cabecalho, Ic, Reveal } from "./ui";

const EXEMPLOS = [
  "Processar a folha de pagamento mensal dos empregados",
  "Enviar newsletter de marketing para clientes cadastrados",
  "Armazenar prontuários e atestados de saúde dos pacientes",
  "Coletar currículo e dados de candidatos no recrutamento",
];

export default function Assistant({ onUpgrade }: { onUpgrade?: () => void }) {
  const { limites, toast, registrar } = useStore();
  const [entrada, setEntrada] = useState("");
  const [resultado, setResultado] = useState<AnaliseLGPD | null>(null);
  const [pensando, setPensando] = useState(false);

  const bloqueado = !limites.ia;

  const analisar = (texto: string) => {
    if (!texto.trim()) return;
    if (bloqueado) {
      toast("O Assistente de IA faz parte dos planos Business/Completo.", "warn");
      onUpgrade?.();
      return;
    }
    setPensando(true);
    setResultado(null);
    setTimeout(() => {
      const r = analisarLGPD(texto);
      setResultado(r);
      registrar("ia", `IA classificou operação: ${r.dados.length} dados, base ${TODAS_BASES.find((b) => b.id === r.baseRecomendada)?.inciso}, risco ${r.score}/25.`);
      toast("Análise concluída pela IA.", "ia");
      setPensando(false);
    }, 900);
  };

  const zona = resultado ? ZONA_META[zonaRisco(resultado.score)] : null;

  return (
    <div>
      <Cabecalho
        kicker="IA · classificação assistida · 100% local"
        titulo="Assistente de IA"
        desc="Descreva uma operação de tratamento em linguagem natural e a IA identifica os dados, titulares, base legal, retenção, salvaguardas e o risco — sem enviar nada para fora do navegador."
      />

      {bloqueado && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-amber/60 bg-amber-soft/50 px-4 py-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-amber text-pine"><Ic name="lock" size={15} sw={2.2} /></span>
          <p className="min-w-0 flex-1 text-[12px] leading-snug text-ink-soft">
            <strong className="text-ink">Assistente de IA bloqueado no seu plano.</strong> Faça upgrade para Business ou Completo e use a classificação ilimitada.
          </p>
          <button onClick={onUpgrade} className="inline-flex items-center gap-1.5 rounded-md bg-pine px-3.5 py-1.5 text-[11.5px] font-extrabold text-lime transition hover:bg-pine-deep active:scale-[0.98]">
            Desbloquear <Ic name="arrow" size={11} />
          </button>
        </div>
      )}

      <Reveal>
        <div className="rounded-xl border border-pine-line bg-pine p-6 text-cream rail-texture">
          <p className="mb-3 flex items-center gap-2 text-[10.5px] font-bold tracking-[0.18em] text-lime uppercase">
            <Ic name="spark" size={13} sw={2.4} /> Descreva a operação de tratamento
          </p>
          <div className="flex flex-col gap-3 md:flex-row">
            <textarea
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) analisar(entrada); }}
              placeholder="Ex.: processar a folha de pagamento mensal dos empregados, compartilhando com a contabilidade…"
              className="min-h-[88px] flex-1 resize-y rounded-md border border-pine-line bg-pine-deep p-3.5 text-[13.5px] leading-relaxed text-cream outline-none placeholder:text-cream/30 focus:border-lime/60"
            />
            <button
              onClick={() => analisar(entrada)}
              disabled={pensando || !entrada.trim()}
              className="group inline-flex items-center justify-center gap-2 self-end rounded-md bg-lime px-6 py-3 text-[13.5px] font-extrabold text-pine transition hover:bg-lime-soft active:scale-[0.98] disabled:opacity-50"
            >
              {pensando ? <span className="inline-block size-4 animate-spin rounded-full border-2 border-pine/30 border-t-pine" /> : <Ic name="wand" size={16} sw={2.2} />}
              {pensando ? "Analisando…" : "Classificar"}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {EXEMPLOS.map((e) => (
              <button key={e} onClick={() => { setEntrada(e); }} className="rounded-full border border-cream/20 px-3 py-1.5 text-[11px] font-semibold text-cream/60 transition hover:border-lime/60 hover:text-lime">
                {e}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {resultado && zona && (
        <Reveal>
          <div className="anim-pop mt-5 grid gap-4 lg:grid-cols-[280px_1fr]">
            {/* risco */}
            <div className="rounded-xl border border-sand bg-cream p-5">
              <p className="text-[10.5px] font-bold tracking-[0.14em] text-ink-faint uppercase">Risco avaliado</p>
              <div className="mt-3 flex items-center gap-4">
                <div className="relative">
                  <div className="grid size-24 place-items-center rounded-full border-4" style={{ borderColor: zona.dot, background: zona.bg }}>
                    <span className="font-display text-[26px] font-extrabold" style={{ color: zona.fg }}>{resultado.score}</span>
                  </div>
                </div>
                <div>
                  <p className="font-display text-[18px] font-extrabold" style={{ color: zona.fg }}>{zona.label}</p>
                  <p className="text-[11px] text-ink-soft">P{resultado.probabilidade} × I{resultado.impacto} / 25</p>
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                {resultado.alertas.map((a) => (
                  <p key={a} className="flex items-start gap-1.5 rounded-md bg-amber-soft/60 px-2.5 py-2 text-[11px] leading-snug font-semibold text-ink">
                    <Ic name="alert" size={12} className="mt-0.5 shrink-0 text-amber" sw={2.4} /> {a}
                  </p>
                ))}
              </div>
            </div>

            {/* detalhes */}
            <div className="rounded-xl border border-sand bg-cream p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-[10.5px] font-bold tracking-[0.14em] text-ink-faint uppercase">Dados identificados ({resultado.dados.length})</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {resultado.dados.map((d) => {
                      const cat = CATEGORIAS_DADOS.find((c) => c.id === d);
                      return (
                        <span key={d} className={`rounded-md px-2 py-1 text-[11.5px] font-bold ${cat?.sensivel ? "bg-rust-soft text-rust" : "bg-paper-deep text-ink-soft"}`}>
                          {cat?.label ?? d}{cat?.sensivel && " · sensível"}
                        </span>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-[10.5px] font-bold tracking-[0.14em] text-ink-faint uppercase">Titulares</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {resultado.sujeitos.map((s) => <span key={s} className="rounded-md bg-paper-deep px-2 py-1 text-[11.5px] font-bold text-ink-soft">{s}</span>)}
                  </div>
                </div>
                <div>
                  <p className="text-[10.5px] font-bold tracking-[0.14em] text-ink-faint uppercase">Base legal recomendada</p>
                  {resultado.bases.map((b) => {
                    const base = TODAS_BASES.find((x) => x.id === b.id);
                    return (
                      <div key={b.id} className="mt-2 rounded-md border border-moss/40 bg-moss/8 px-3 py-2.5">
                        <p className="text-[12px] font-bold text-moss">{base?.inciso} — {base?.titulo}</p>
                        <p className="text-[10.5px] leading-snug text-ink-soft">{b.rationale}</p>
                      </div>
                    );
                  })}
                  <p className="mt-4 text-[10.5px] font-bold tracking-[0.14em] text-ink-faint uppercase">Retenção sugerida</p>
                  <p className="mt-1.5 text-[12px] font-semibold text-ink-soft">{resultado.retencao} <span className="text-ink-faint">({resultado.retencaoJustificativa})</span></p>
                  <p className="mt-4 text-[10.5px] font-bold tracking-[0.14em] text-ink-faint uppercase">Salvaguardas</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {resultado.medidas.map((m) => <span key={m} className="rounded-md bg-paper-deep px-2 py-1 text-[11px] font-semibold text-ink-soft">{m}</span>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
