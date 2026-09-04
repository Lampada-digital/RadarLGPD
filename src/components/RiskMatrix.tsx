import { useMemo, useState } from "react";
import { useStore } from "../store";
import { TODAS_BASES, ZONA_META, zonaRisco } from "../types";
import { Cabecalho, Ic, Reveal } from "./ui";

export default function RiskMatrix() {
  const { atividades } = useStore();
  const [sel, setSel] = useState<{ p: number; i: number } | null>(null);

  const celulas = useMemo(() => {
    const m = new Map<string, typeof atividades>();
    atividades.forEach((a) => {
      const k = `${a.probabilidade}-${a.impacto}`;
      m.set(k, [...(m.get(k) ?? []), a]);
    });
    return m;
  }, [atividades]);

  const top = useMemo(
    () => [...atividades].sort((a, b) => b.probabilidade * b.impacto - a.probabilidade * a.impacto).slice(0, 6),
    [atividades]
  );

  const selAtivs = sel ? celulas.get(`${sel.p}-${sel.i}`) ?? [] : [];
  const selScore = sel ? sel.p * sel.i : 0;
  const selMeta = sel ? ZONA_META[zonaRisco(selScore)] : null;

  return (
    <div>
      <Cabecalho
        kicker="Gestão de riscos · Art. 46 e 38"
        titulo="Matriz de risco 5 × 5"
        desc="Cada ponto é uma atividade de tratamento posicionada por probabilidade × impacto. Clique numa célula para inspecionar e priorize o plano de ação pelos quadrantes críticos."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* matriz */}
        <Reveal>
          <div className="rounded-xl border border-sand bg-cream p-5">
            <div className="flex items-center gap-4">
              <span className="font-display shrink-0 text-[11px] font-bold tracking-[0.14em] text-ink-faint uppercase" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                Impacto →
              </span>
              <div className="flex-1">
                <div className="grid grid-cols-5 gap-1.5">
                  {[5, 4, 3, 2, 1].map((i) =>
                    [1, 2, 3, 4, 5].map((p) => {
                      const score = p * i;
                      const z = ZONA_META[zonaRisco(score)];
                      const list = celulas.get(`${p}-${i}`) ?? [];
                      const ativo = sel?.p === p && sel?.i === i;
                      return (
                        <button
                          key={`${p}-${i}`}
                          onClick={() => setSel(ativo ? null : { p, i })}
                          className={`group relative aspect-[5/3] rounded-md border p-1.5 text-left transition-all duration-150 ${ativo ? "z-10 scale-[1.04] border-ink shadow-lg" : "border-transparent hover:scale-[1.02] hover:border-ink/30"}`}
                          style={{ background: z.bg }}
                          title={`${list.length} atividade(s) · risco ${score}`}
                        >
                          <span className="font-display absolute top-1 left-1.5 text-[10px] font-bold" style={{ color: z.fg, opacity: 0.65 }}>{score}</span>
                          <span className="absolute right-1.5 bottom-1.5 flex flex-wrap justify-end gap-1">
                            {list.slice(0, 4).map((a) => (
                              <span key={a.id} className="grid size-4.5 place-items-center rounded-full border border-cream/70 text-[8px] font-extrabold text-cream shadow-sm" style={{ background: z.dot }}>
                                {a.nome.slice(0, 1)}
                              </span>
                            ))}
                            {list.length > 4 && <span className="text-[9px] font-bold" style={{ color: z.fg }}>+{list.length - 4}</span>}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
                <div className="mt-1.5 grid grid-cols-5 gap-1.5 text-center">
                  {[1, 2, 3, 4, 5].map((p) => (
                    <span key={p} className="text-[10.5px] font-bold text-ink-faint">{p}</span>
                  ))}
                </div>
                <p className="mt-1 text-center text-[11px] font-bold tracking-[0.14em] text-ink-faint uppercase">Probabilidade →</p>
              </div>
            </div>

            {/* legenda */}
            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-sand pt-4">
              {(["baixo", "moderado", "alto", "critico"] as const).map((z) => (
                <span key={z} className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-soft">
                  <span className="size-3 rounded-sm" style={{ background: ZONA_META[z].dot }} /> {ZONA_META[z].label}
                </span>
              ))}
              <span className="ml-auto text-[11px] text-ink-faint">Risco = Probabilidade × Impacto (1–25)</span>
            </div>
          </div>
        </Reveal>

        {/* detalhe da célula */}
        <div className="space-y-4">
          <Reveal delay={80}>
            <div className={`rounded-xl border p-5 transition-colors ${sel ? "border-pine-line bg-pine text-cream" : "border-dashed border-sand bg-paper/70"}`}>
              {!sel ? (
                <div className="py-6 text-center">
                  <Ic name="matrix" size={26} className="mx-auto text-sand" />
                  <p className="font-display mt-2.5 text-[14.5px] font-bold text-ink-soft">Nenhuma célula selecionada</p>
                  <p className="mt-1 text-[12px] text-ink-faint">Clique em um quadrante da matriz para listar as atividades daquela combinação de risco.</p>
                </div>
              ) : (
                <div className="anim-pop">
                  <div className="flex items-center justify-between">
                    <p className="text-[10.5px] font-bold tracking-[0.14em] uppercase" style={{ color: selMeta!.dot }}>
                      Zona {selMeta!.label.toLowerCase()}
                    </p>
                    <span className="font-display text-[22px] font-extrabold text-cream">{selScore}<span className="text-[12px] text-cream/50">/25</span></span>
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-cream/60">Probabilidade {sel.p}/5 · Impacto {sel.i}/5 · {selAtivs.length} atividade(s)</p>
                  <ul className="mt-3 space-y-2">
                    {selAtivs.length === 0 && <p className="rounded-md bg-pine-deep px-3 py-2.5 text-[12px] text-cream/60">Nenhuma atividade neste quadrante — bom sinal.</p>}
                    {selAtivs.map((a) => (
                      <li key={a.id} className="rounded-md border border-pine-line bg-pine-deep/70 px-3 py-2.5 transition hover:border-lime/40">
                        <p className="text-[12.5px] font-bold text-cream">{a.nome}</p>
                        <p className="mt-0.5 text-[10.5px] text-cream/55">{a.area} · {TODAS_BASES.find((b) => b.id === a.baseLegalId)?.inciso} · {a.medidas.length} salvaguarda(s)</p>
                      </li>
                    ))}
                  </ul>
                  {selScore >= 10 && (
                    <p className="mt-3 flex items-start gap-1.5 rounded-md bg-amber/15 px-3 py-2 text-[11px] leading-snug text-amber">
                      <Ic name="alert" size={12} className="mt-0.5 shrink-0" sw={2.2} /> Priorize RIPD (art. 38) e revisão com o Encarregado para este quadrante.
                    </p>
                  )}
                </div>
              )}
            </div>
          </Reveal>

          {/* ranking */}
          <Reveal delay={140}>
            <div className="rounded-xl border border-sand bg-cream p-5">
              <h2 className="font-display mb-3 text-[15px] font-bold text-ink">Prioridades do plano de ação</h2>
              <ul className="space-y-1">
                {top.map((a, i) => {
                  const s = a.probabilidade * a.impacto;
                  const z = ZONA_META[zonaRisco(s)];
                  return (
                    <li key={a.id} className="group flex items-center gap-3 rounded-md px-2 py-2 transition hover:bg-paper">
                      <span className="font-display w-5 text-[15px] font-extrabold text-sand group-hover:text-moss">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-semibold text-ink">{a.nome}</p>
                        <p className="text-[10.5px] text-ink-faint">{a.area} · {a.medidas.length} medida(s)</p>
                      </div>
                      <span className="font-display rounded-md px-2 py-1 text-[12px] font-extrabold" style={{ background: z.bg, color: z.fg }}>{s}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
