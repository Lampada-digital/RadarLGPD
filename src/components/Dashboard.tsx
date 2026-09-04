import { useMemo } from "react";
import { useStore } from "../store";
import { TODAS_BASES, ZONA_META, diasDesde, fmtData, PRAZO_LGPD_DIAS, zonaRisco } from "../types";
import type { Page } from "../App";
import { Ic, Reveal, Ring, useCountUp } from "./ui";

function Stat({ label, valor, sufixo, detalhe, tom = "ink" }: { label: string; valor: number; sufixo?: string; detalhe: string; tom?: "ink" | "rust" | "moss" | "amber" }) {
  const v = useCountUp(valor);
  const cor = tom === "rust" ? "text-rust" : tom === "moss" ? "text-moss" : tom === "amber" ? "text-amber" : "text-ink";
  return (
    <div className="group relative overflow-hidden rounded-lg border border-sand bg-cream p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-moss/50 hover:shadow-[0_10px_28px_-14px_rgba(19,46,38,0.35)]">
      <p className="text-[10.5px] font-bold tracking-[0.12em] text-ink-faint uppercase">{label}</p>
      <p className={`font-display mt-2 text-[34px] leading-none font-extrabold tracking-tight ${cor}`}>
        {v}
        {sufixo && <span className="ml-1 text-[15px] font-bold text-ink-faint">{sufixo}</span>}
      </p>
      <p className="mt-2 text-[11.5px] leading-snug text-ink-soft">{detalhe}</p>
      <span className="absolute right-0 bottom-0 h-10 w-10 translate-x-4 translate-y-4 rounded-full bg-paper-deep transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />
    </div>
  );
}

export default function Dashboard({ irPara }: { irPara: (p: Page) => void }) {
  const { atividades, solicitacoes, checklist, score, scoreFatores, toggleCheck, toast } = useStore();

  const stats = useMemo(() => {
    const dados = new Set(atividades.flatMap((a) => a.dados));
    const sensiveis = atividades.filter((a) => a.dados.some((d) => ["saude", "biometria", "religiao", "racial", "politico", "menor"].includes(d)));
    const altoRisco = atividades.filter((a) => ["alto", "critico"].includes(zonaRisco(a.probabilidade * a.impacto)));
    const abertas = solicitacoes.filter((s) => s.status !== "concluida");
    const pertoPrazo = abertas.filter((s) => diasDesde(s.data) >= PRAZO_LGPD_DIAS - 5);
    return { dados: dados.size, sensiveis: sensiveis.length, altoRisco: altoRisco.length, abertas: abertas.length, pertoPrazo: pertoPrazo.length };
  }, [atividades, solicitacoes]);

  const bases = useMemo(() => {
    const cont = new Map<string, number>();
    atividades.forEach((a) => cont.set(a.baseLegalId, (cont.get(a.baseLegalId) ?? 0) + 1));
    return [...cont.entries()]
      .map(([id, n]) => ({ base: TODAS_BASES.find((b) => b.id === id), n }))
      .filter((b) => b.base)
      .sort((a, b) => b.n - a.n)
      .slice(0, 5);
  }, [atividades]);

  const zonas = useMemo(() => {
    const z = { baixo: 0, moderado: 0, alto: 0, critico: 0 } as Record<string, number>;
    atividades.forEach((a) => z[zonaRisco(a.probabilidade * a.impacto)]++);
    return z;
  }, [atividades]);

  const feitas = checklist.filter((c) => c.feito).length;
  const scoreCor = score >= 80 ? "var(--color-moss)" : score >= 60 ? "var(--color-amber)" : "var(--color-rust)";
  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="space-y-5">
      {/* cabeçalho característico: o radar */}
      <Reveal>
        <div className="relative overflow-hidden rounded-xl border border-pine-line bg-pine text-cream rail-texture">
          <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full border border-lime/15" />
          <div className="pointer-events-none absolute -top-14 -right-10 size-52 rounded-full border border-lime/20" />
          <div className="pointer-events-none absolute top-2 right-4 size-36 rounded-full border border-lime/25">
            <div className="radar-sweep absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, rgba(201,233,79,0.28), transparent 70deg)" }} />
          </div>
          <div className="relative flex flex-wrap items-center justify-between gap-6 px-6 py-6 sm:px-8">
            <div className="max-w-xl">
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-lime/30 bg-pine-deep/60 px-3 py-1 text-[10.5px] font-bold tracking-[0.18em] text-lime uppercase">
                <span className="pulse-dot inline-block size-1.5 rounded-full bg-lime" />
                Monitor ativo · Lei nº 13.709/2018
              </p>
              <h1 className="font-display text-[30px] leading-[1.05] font-extrabold tracking-tight sm:text-[40px]">
                Mapa de dados pessoais <span className="text-lime">sob vigilância.</span>
              </h1>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-cream/70">
                Registro das operações de tratamento (art. 37), bases legais, riscos e direitos dos titulares — com classificação assistida por IA que roda 100% no seu navegador.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <button onClick={() => irPara("assistente")} className="group inline-flex items-center gap-2 rounded-md bg-lime px-4 py-2.5 text-[13px] font-bold text-pine transition hover:bg-lime-soft active:scale-[0.98]">
                  <Ic name="spark" size={15} sw={2.2} />
                  Classificar com IA
                  <Ic name="arrow" size={14} className="transition-transform group-hover:translate-x-0.5" />
                </button>
                <button onClick={() => irPara("atividades")} className="inline-flex items-center gap-2 rounded-md border border-cream/25 px-4 py-2.5 text-[13px] font-semibold text-cream transition hover:border-lime/60 hover:text-lime active:scale-[0.98]">
                  <Ic name="plus" size={14} sw={2.4} />
                  Nova atividade
                </button>
              </div>
            </div>
            <div className="flex items-center gap-5 rounded-lg border border-cream/12 bg-pine-deep/70 px-6 py-5">
              <div className="relative">
                <Ring value={score} size={128} stroke={10} cor={scoreCor} />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <p className="font-display text-[34px] leading-none font-extrabold text-cream">{score}</p>
                    <p className="text-[9.5px] font-bold tracking-[0.14em] text-cream/50 uppercase">/ 100</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10.5px] font-bold tracking-[0.14em] text-lime uppercase">Índice de maturidade</p>
                <p className="mt-1 font-display text-[15px] font-bold text-cream">{score >= 80 ? "Programa sólido" : score >= 60 ? "Em consolidação" : "Atenção imediata"}</p>
                <p className="mt-0.5 max-w-[160px] text-[11px] leading-snug text-cream/55">Composto por 5 fatores ponderados de conformidade.</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* estatísticas */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <Reveal delay={40}><Stat label="Atividades mapeadas" valor={atividades.length} detalhe={`${atividades.filter((a) => a.origem === "ia").length} classificadas pela IA`} /></Reveal>
        <Reveal delay={90}><Stat label="Categorias de dados" valor={stats.dados} detalhe="Dados pessoais distintos no inventário" tom="moss" /></Reveal>
        <Reveal delay={140}><Stat label="Tratam dado sensível" valor={stats.sensiveis} sufixo="ativ." detalhe="Art. 11 — exige base específica e reforço de segurança" tom="rust" /></Reveal>
        <Reveal delay={190}>
          <Stat label="Solicitações em aberto" valor={stats.abertas} detalhe={stats.pertoPrazo ? `${stats.pertoPrazo} a menos de 5 dias do prazo (art. 19)` : "Todas dentro do prazo de 15 dias"} tom={stats.pertoPrazo ? "amber" : "ink"} />
        </Reveal>
      </div>

      {/* linha 2: bases legais / risco / recentes */}
      <div className="grid gap-3.5 lg:grid-cols-3">
        <Reveal className="lg:col-span-1">
          <div className="flex h-full flex-col rounded-lg border border-sand bg-cream p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[15px] font-bold text-ink">Bases legais em uso</h2>
              <Ic name="scale" size={16} className="text-moss" />
            </div>
            <div className="space-y-3.5">
              {bases.map(({ base, n }, i) => (
                <div key={base!.id}>
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <p className="truncate text-[12.5px] font-semibold text-ink">{base!.titulo}</p>
                    <span className="font-display shrink-0 text-[12px] font-bold text-moss">{n}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-paper-deep">
                    <div className="bar-grow h-full rounded-full bg-moss" style={{ width: `${(n / atividades.length) * 100}%`, animationDelay: `${i * 90 + 200}ms` }} />
                  </div>
                  <p className="mt-0.5 text-[10.5px] text-ink-faint">{base!.inciso}</p>
                </div>
              ))}
            </div>
            <button onClick={() => irPara("bases")} className="group mt-auto inline-flex items-center gap-1.5 pt-4 text-[12px] font-bold text-moss transition hover:text-pine">
              Ver as 18 bases legais <Ic name="arrow" size={12} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-1">
          <div className="flex h-full flex-col rounded-lg border border-sand bg-cream p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[15px] font-bold text-ink">Distribuição de risco</h2>
              <Ic name="matrix" size={16} className="text-moss" />
            </div>
            <div className="space-y-2.5">
              {(["baixo", "moderado", "alto", "critico"] as const).map((z, i) => {
                const n = zonas[z] ?? 0;
                const pct = atividades.length ? (n / atividades.length) * 100 : 0;
                return (
                  <div key={z} className="flex items-center gap-3">
                    <span className="w-[76px] text-[11px] font-bold tracking-wide uppercase" style={{ color: ZONA_META[z].fg }}>{ZONA_META[z].label}</span>
                    <div className="h-7 flex-1 overflow-hidden rounded-md bg-paper-deep">
                      <div className="bar-grow flex h-full items-center rounded-md px-2" style={{ width: `${Math.max(pct, n ? 12 : 2)}%`, background: ZONA_META[z].dot, animationDelay: `${i * 90 + 200}ms` }}>
                        {n > 0 && <span className="font-display text-[11.5px] font-bold text-cream">{n}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-md border border-amber/40 bg-amber-soft/50 p-3">
              <p className="flex items-center gap-1.5 text-[11.5px] font-bold text-ink">
                <Ic name="alert" size={13} className="text-amber" sw={2.2} />
                {(zonas.alto ?? 0) + (zonas.critico ?? 0)} atividade(s) exigem RIPD
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-ink-soft">Avaliação de impacto recomendada pelo art. 38 para tratamentos de alto risco.</p>
            </div>
            <button onClick={() => irPara("risco")} className="group mt-auto inline-flex items-center gap-1.5 pt-4 text-[12px] font-bold text-moss transition hover:text-pine">
              Abrir matriz de risco <Ic name="arrow" size={12} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </Reveal>

        <Reveal delay={160} className="lg:col-span-1">
          <div className="flex h-full flex-col rounded-lg border border-sand bg-cream p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[15px] font-bold text-ink">Últimos mapeamentos</h2>
              <Ic name="layers" size={16} className="text-moss" />
            </div>
            <ul className="space-y-2.5">
              {[...atividades].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)).slice(0, 4).map((a) => {
                const z = zonaRisco(a.probabilidade * a.impacto);
                return (
                  <li key={a.id}>
                    <button onClick={() => irPara("atividades")} className="group w-full rounded-md border border-transparent px-2.5 py-2 text-left transition hover:border-sand hover:bg-paper">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[13px] font-semibold text-ink">{a.nome}</p>
                        <span className="size-2 shrink-0 rounded-full" style={{ background: ZONA_META[z].dot }} />
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-ink-faint">
                        <span>{a.area}</span>·<span>{fmtData(a.criadoEm)}</span>
                        {a.origem === "ia" && (
                          <span className="inline-flex items-center gap-1 rounded-sm bg-lime-soft px-1.5 py-0.5 font-bold text-[9.5px] tracking-wide text-pine uppercase">
                            <Ic name="spark" size={9} sw={2.6} /> IA
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button onClick={() => irPara("atividades")} className="group mt-auto inline-flex items-center gap-1.5 pt-4 text-[12px] font-bold text-moss transition hover:text-pine">
              Ver registro completo <Ic name="arrow" size={12} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </Reveal>
      </div>

      {/* linha 3: checklist + solicitações */}
      <div className="grid gap-3.5 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="h-full rounded-lg border border-sand bg-cream p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-[15px] font-bold text-ink">Programa de conformidade</h2>
                <p className="text-[11.5px] text-ink-soft">{feitas} de {checklist.length} controles implementados</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-paper-deep">
                  <div className="bar-grow h-full rounded-full bg-lime" style={{ width: `${(feitas / checklist.length) * 100}%`, animationDelay: "250ms" }} />
                </div>
                <span className="font-display text-[13px] font-bold text-moss">{Math.round((feitas / checklist.length) * 100)}%</span>
              </div>
            </div>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {checklist.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => { toggleCheck(c.id); toast(c.feito ? "Controle marcado como pendente." : "Controle implementado — maturidade atualizada.", c.feito ? "warn" : "ok"); }}
                    className={`flex w-full items-start gap-2.5 rounded-md border px-3 py-2.5 text-left transition-all duration-150 ${c.feito ? "border-moss/35 bg-moss/8 hover:border-moss/60" : "border-sand bg-paper hover:border-moss/50"}`}
                  >
                    <span className={`mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-sm border transition ${c.feito ? "border-moss bg-moss text-cream" : "border-sand bg-cream"}`}>
                      {c.feito && <Ic name="check" size={10} sw={3} />}
                    </span>
                    <span>
                      <span className={`block text-[12.5px] leading-snug font-semibold ${c.feito ? "text-ink" : "text-ink-soft"}`}>{c.label}</span>
                      <span className="text-[10.5px] font-semibold tracking-wide text-moss uppercase">{c.artigo}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={100} className="lg:col-span-2">
          <div className="flex h-full flex-col rounded-lg border border-sand bg-cream p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[15px] font-bold text-ink">Direitos dos titulares</h2>
              <Ic name="user" size={16} className="text-moss" />
            </div>
            <ul className="space-y-2.5">
              {solicitacoes.slice(0, 4).map((s) => {
                const d = diasDesde(s.data);
                const restante = PRAZO_LGPD_DIAS - d;
                return (
                  <li key={s.id} className="flex items-center justify-between gap-3 rounded-md border border-sand bg-paper px-3 py-2.5 transition hover:border-moss/45">
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-semibold text-ink">{s.tipo}</p>
                      <p className="text-[11px] text-ink-faint">{s.titular} · {fmtData(s.data)}</p>
                    </div>
                    {s.status === "concluida" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-moss/12 px-2 py-0.5 text-[10.5px] font-bold text-moss"><Ic name="check" size={10} sw={3} /> Concluída</span>
                    ) : restante < 0 ? (
                      <span className="rounded-full bg-rust px-2 py-0.5 text-[10.5px] font-bold text-cream">Prazo estourado</span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${restante <= 5 ? "bg-amber-soft text-ink" : "bg-paper-deep text-ink-soft"}`}>
                        <Ic name="clock" size={10} sw={2.4} /> {restante}d restantes
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            <button onClick={() => irPara("solicitacoes")} className="group mt-auto inline-flex items-center gap-1.5 pt-4 text-[12px] font-bold text-moss transition hover:text-pine">
              Gerenciar solicitações <Ic name="arrow" size={12} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </Reveal>
      </div>

      {/* rodapé da página */}
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-sand bg-paper/60 px-5 py-3.5">
          <p className="text-[11.5px] text-ink-faint">
            “O controlador deve manter registro das operações de tratamento de dados pessoais que realizar.” — <strong className="text-ink-soft">Art. 37, Lei nº 13.709/2018</strong>
          </p>
          <p className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">Dados de demonstração · edite livremente</p>
        </div>
      </Reveal>
    </div>
  );
}
