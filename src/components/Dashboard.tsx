import { useMemo } from "react";
import { useStore } from "../store";
import { TODAS_BASES, ZONA_META, diasDesde, fmtData, prazoDe, zonaRisco } from "../types";
import { DADOS_GDPR } from "../gdpr";
import { FRAMEWORKS, progressoFramework } from "../frameworks";
import type { Page } from "../App";
import { Ic, Reveal, Ring, useCountUp } from "./ui";

function Stat({ label, valor, sufixo, detalhe, tom = "ink" }: { label: string; valor: number; sufixo?: string; detalhe: string; tom?: "ink" | "rust" | "moss" | "amber" | "azul" }) {
  const v = useCountUp(valor);
  const cor = tom === "rust" ? "text-rust" : tom === "moss" ? "text-moss" : tom === "amber" ? "text-amber" : tom === "azul" ? "text-[#1f4e8f]" : "text-ink";
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

function Pilar({ label, valor, detalhe, cor }: { label: string; valor: number; detalhe: string; cor: string }) {
  return (
    <div className="flex items-center gap-3.5 rounded-lg border border-cream/12 bg-pine-deep/70 px-4 py-3">
      <div className="relative shrink-0">
        <Ring value={valor} size={64} stroke={6} cor={cor} />
        <p className="font-display absolute inset-0 grid place-items-center text-[15px] font-extrabold text-cream">{valor}</p>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: cor }}>{label}</p>
        <p className="mt-0.5 truncate text-[11.5px] text-cream/60">{detalhe}</p>
      </div>
    </div>
  );
}

export default function Dashboard({ irPara }: { irPara: (p: Page) => void }) {
  const { atividades, solicitacoes, checklist, gdprAtividades, transferencias, dpiaChecks, iso, score, toggleCheck, toast } = useStore();

  const lgpd = useMemo(() => {
    const dados = new Set(atividades.flatMap((a) => a.dados));
    const sensiveis = atividades.filter((a) => a.dados.some((d) => ["saude", "biometria", "religiao", "racial", "politico", "menor"].includes(d)));
    const zonas = { baixo: 0, moderado: 0, alto: 0, critico: 0 } as Record<string, number>;
    atividades.forEach((a) => zonas[zonaRisco(a.probabilidade * a.impacto)]++);
    const cont = new Map<string, number>();
    atividades.forEach((a) => cont.set(a.baseLegalId, (cont.get(a.baseLegalId) ?? 0) + 1));
    const bases = [...cont.entries()]
      .map(([id, n]) => ({ base: TODAS_BASES.find((b) => b.id === id), n }))
      .filter((b) => b.base)
      .sort((a, b) => b.n - a.n)
      .slice(0, 5);
    return { dados: dados.size, sensiveis: sensiveis.length, zonas, bases };
  }, [atividades]);

  const gdpr = useMemo(() => {
    const especiais = gdprAtividades.filter((a) => a.dados.some((d) => DADOS_GDPR.find((x) => x.id === d)?.especial)).length;
    const comRet = gdprAtividades.filter((a) => a.retencao.trim()).length;
    const transf = gdprAtividades.filter((a) => a.transferencia);
    const comMec = transf.filter((a) => a.mecanismoTransferencia).length;
    const fRet = gdprAtividades.length ? comRet / gdprAtividades.length : 1;
    const fMec = transf.length ? comMec / transf.length : 1;
    const prontidao = Math.round(((fRet + fMec) / 2) * 100);
    const criticas = transferencias.filter((t) => t.status !== "vigente").length;
    const dpiaMarcados = Object.values(dpiaChecks).filter(Boolean).length;
    return { especiais, prontidao, criticas, dpiaObrigatoria: dpiaMarcados >= 2 };
  }, [gdprAtividades, transferencias, dpiaChecks]);

  const isoStats = useMemo(() => {
    let total = 0;
    let conformes = 0;
    const por = FRAMEWORKS.map((fw) => {
      const p = progressoFramework(fw, iso);
      total += fw.controles.length;
      conformes += p.porEstado.impl + p.porEstado.verif;
      return { fw, p };
    });
    return { total, conformes, por, media: Math.round(por.reduce((acc, x) => acc + x.p.pct, 0) / FRAMEWORKS.length) };
  }, [iso]);

  const abertas = solicitacoes.filter((s) => s.status !== "concluida");
  const pertoPrazo = abertas.filter((s) => diasDesde(s.data) >= prazoDe(s) - 5);
  const feitas = checklist.filter((c) => c.feito).length;

  return (
    <div className="space-y-5">
      {/* cabeçalho: radar + 3 pilares */}
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
                Monitor ativo · LGPD 13.709/18 · GDPR (UE) 2016/679 · 7 normas ISO
              </p>
              <h1 className="font-display text-[30px] leading-[1.05] font-extrabold tracking-tight sm:text-[38px]">
                Privacidade e compliance <span className="text-lime">sob o mesmo radar.</span>
              </h1>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-cream/70">
                Mapeamento de dados (art. 37 / Art. 30), matriz de riscos, programas ISO e direitos dos titulares — com classificação assistida por IA que roda 100% no seu navegador.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <button onClick={() => irPara("assistente")} className="group inline-flex items-center gap-2 rounded-md bg-lime px-4 py-2.5 text-[13px] font-bold text-pine transition hover:bg-lime-soft active:scale-[0.98]">
                  <Ic name="spark" size={15} sw={2.2} />
                  Classificar com IA
                  <Ic name="arrow" size={14} className="transition-transform group-hover:translate-x-0.5" />
                </button>
                <button onClick={() => irPara("iso")} className="inline-flex items-center gap-2 rounded-md border border-cream/25 px-4 py-2.5 text-[13px] font-semibold text-cream transition hover:border-lime/60 hover:text-lime active:scale-[0.98]">
                  <Ic name="layers" size={14} />
                  Programas ISO
                </button>
              </div>
            </div>
            <div className="flex min-w-[280px] flex-col gap-2.5">
              <Pilar label="Maturidade LGPD" valor={score} detalhe="Índice composto por 5 fatores ponderados" cor="var(--color-lime)" />
              <Pilar label="Prontidão GDPR" valor={gdpr.prontidao} detalhe="Retenção + mecanismos de transferência (Cap. V)" cor="#8fb8f0" />
              <Pilar label="Conformidade ISO" valor={isoStats.media} detalhe={`${isoStats.conformes}/${isoStats.total} controles conformes (média)`} cor="#e8b64c" />
            </div>
          </div>
        </div>
      </Reveal>

      {/* estatísticas */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <Reveal delay={40}><Stat label="Atividades LGPD" valor={atividades.length} detalhe={`${atividades.filter((a) => a.origem === "ia").length} classificadas pela IA · ${lgpd.sensiveis} com dado sensível`} /></Reveal>
        <Reveal delay={90}><Stat label="Operações GDPR (Art. 30)" valor={gdprAtividades.length} detalhe={`${gdpr.especiais} tratam categorias especiais (Art. 9)`} tom="azul" /></Reveal>
        <Reveal delay={140}><Stat label="Controles ISO conformes" valor={isoStats.conformes} sufixo={`/${isoStats.total}`} detalhe="Implementados ou verificados nos 7 frameworks" tom="moss" /></Reveal>
        <Reveal delay={190}>
          <Stat label="Solicitações em aberto" valor={abertas.length} detalhe={pertoPrazo.length ? `${pertoPrazo.length} a ≤5 dias do prazo legal` : "Todas dentro do prazo (15d LGPD · 30d GDPR)"} tom={pertoPrazo.length ? "amber" : "ink"} />
        </Reveal>
      </div>

      {/* linha 2 */}
      <div className="grid gap-3.5 lg:grid-cols-3">
        <Reveal>
          <div className="flex h-full flex-col rounded-lg border border-sand bg-cream p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[15px] font-bold text-ink">Bases legais LGPD em uso</h2>
              <Ic name="scale" size={16} className="text-moss" />
            </div>
            <div className="space-y-3.5">
              {lgpd.bases.map(({ base, n }, i) => (
                <div key={base!.id}>
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <p className="truncate text-[12.5px] font-semibold text-ink">{base!.titulo}</p>
                    <span className="font-display shrink-0 text-[12px] font-bold text-moss">{n}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-paper-deep">
                    <div className="bar-grow h-full rounded-full bg-moss" style={{ width: `${(n / (atividades.length || 1)) * 100}%`, animationDelay: `${i * 90 + 200}ms` }} />
                  </div>
                  <p className="mt-0.5 text-[10.5px] text-ink-faint">{base!.inciso}</p>
                </div>
              ))}
            </div>
            <button onClick={() => irPara("lgpd-bases")} className="group mt-auto inline-flex items-center gap-1.5 pt-4 text-[12px] font-bold text-moss transition hover:text-pine">
              Ver as 18 bases legais <Ic name="arrow" size={12} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="flex h-full flex-col rounded-lg border border-sand bg-cream p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[15px] font-bold text-ink">Risco LGPD</h2>
              <Ic name="matrix" size={16} className="text-moss" />
            </div>
            <div className="space-y-2.5">
              {(["baixo", "moderado", "alto", "critico"] as const).map((z, i) => {
                const n = lgpd.zonas[z] ?? 0;
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
                {(lgpd.zonas.alto ?? 0) + (lgpd.zonas.critico ?? 0)} atividade(s) exigem RIPD
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-ink-soft">Avaliação de impacto recomendada pelo art. 38 (LGPD) e Art. 35 (GDPR).</p>
            </div>
            <button onClick={() => irPara("lgpd-risco")} className="group mt-auto inline-flex items-center gap-1.5 pt-4 text-[12px] font-bold text-moss transition hover:text-pine">
              Abrir matriz 5×5 <Ic name="arrow" size={12} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="flex h-full flex-col rounded-lg border border-sand bg-cream p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[15px] font-bold text-ink">Programas ISO</h2>
              <Ic name="layers" size={16} className="text-moss" />
            </div>
            <ul className="space-y-2.5">
              {isoStats.por.map(({ fw, p }, i) => (
                <li key={fw.id}>
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <p className="truncate text-[11.5px] font-bold text-ink">{fw.codigo}</p>
                    <span className="font-display shrink-0 text-[11.5px] font-bold" style={{ color: fw.cor }}>{p.pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-paper-deep">
                    <div className="bar-grow h-full rounded-full" style={{ width: `${Math.max(p.pct, 2)}%`, background: fw.cor, animationDelay: `${i * 70 + 200}ms` }} />
                  </div>
                </li>
              ))}
            </ul>
            <button onClick={() => irPara("iso")} className="group mt-auto inline-flex items-center gap-1.5 pt-4 text-[12px] font-bold text-moss transition hover:text-pine">
              Abrir implementação <Ic name="arrow" size={12} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </Reveal>
      </div>

      {/* linha 3 */}
      <div className="grid gap-3.5 lg:grid-cols-3">
        <Reveal>
          <div className="h-full rounded-lg border border-sand bg-cream p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-[15px] font-bold text-ink">Programa LGPD</h2>
                <p className="text-[11.5px] text-ink-soft">{feitas}/{checklist.length} controles</p>
              </div>
              <span className="font-display text-[13px] font-bold text-moss">{Math.round((feitas / checklist.length) * 100)}%</span>
            </div>
            <ul className="grid gap-1.5">
              {checklist.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => { toggleCheck(c.id); toast(c.feito ? "Controle marcado como pendente." : "Controle implementado — maturidade atualizada.", c.feito ? "warn" : "ok"); }}
                    className={`flex w-full items-start gap-2.5 rounded-md border px-3 py-2 text-left transition-all duration-150 ${c.feito ? "border-moss/35 bg-moss/8" : "border-sand bg-paper hover:border-moss/50"}`}
                  >
                    <span className={`mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-sm border transition ${c.feito ? "border-moss bg-moss text-cream" : "border-sand bg-cream"}`}>
                      {c.feito && <Ic name="check" size={10} sw={3} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] leading-snug font-semibold text-ink">{c.label}</span>
                      <span className="text-[10px] font-bold tracking-wide text-moss uppercase">{c.artigo}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="flex h-full flex-col rounded-lg border border-sand bg-cream p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[15px] font-bold text-ink">Alertas GDPR</h2>
              <Ic name="globe" size={16} className="text-[#1f4e8f]" />
            </div>
            <ul className="space-y-2">
              <li className={`rounded-md border px-3.5 py-3 ${gdpr.especiais ? "border-rust/40 bg-rust-soft/40" : "border-sand bg-paper"}`}>
                <p className="text-[12px] font-bold text-ink">{gdpr.especiais} operação(ões) com Art. 9</p>
                <p className="text-[10.5px] text-ink-soft">Condição específica e medidas reforçadas exigidas.</p>
              </li>
              <li className={`rounded-md border px-3.5 py-3 ${gdpr.criticas ? "border-amber/50 bg-amber-soft/50" : "border-sand bg-paper"}`}>
                <p className="text-[12px] font-bold text-ink">{gdpr.criticas} transferência(s) fora do EEE pendentes</p>
                <p className="text-[10.5px] text-ink-soft">SCCs/TIA a concluir no Capítulo V.</p>
              </li>
              <li className={`rounded-md border px-3.5 py-3 ${gdpr.dpiaObrigatoria ? "border-rust/40 bg-rust-soft/40" : "border-sand bg-paper"}`}>
                <p className="text-[12px] font-bold text-ink">{gdpr.dpiaObrigatoria ? "DPIA obrigatória em avaliação" : "DPIA não exigida no momento"}</p>
                <p className="text-[10.5px] text-ink-soft">Critérios EDPB (WP248) aplicados à análise atual.</p>
              </li>
            </ul>
            <button onClick={() => irPara("gdpr-ropa")} className="group mt-auto inline-flex items-center gap-1.5 pt-4 text-[12px] font-bold text-[#1f4e8f] transition hover:text-pine">
              Abrir ROPA (Art. 30) <Ic name="arrow" size={12} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="flex h-full flex-col rounded-lg border border-sand bg-cream p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-[15px] font-bold text-ink">Direitos dos titulares</h2>
              <Ic name="user" size={16} className="text-moss" />
            </div>
            <ul className="space-y-2.5">
              {solicitacoes.slice(0, 4).map((s) => {
                const d = diasDesde(s.data);
                const restante = prazoDe(s) - d;
                const gdprRegime = s.regime === "GDPR";
                return (
                  <li key={s.id} className="flex items-center justify-between gap-3 rounded-md border border-sand bg-paper px-3 py-2.5 transition hover:border-moss/45">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate text-[12.5px] font-semibold text-ink">
                        <span className={`shrink-0 rounded-sm px-1 py-px text-[8.5px] font-extrabold tracking-wide uppercase ${gdprRegime ? "bg-[#1f4e8f]/10 text-[#1f4e8f]" : "bg-moss/12 text-moss"}`}>{s.regime ?? "LGPD"}</span>
                        {s.tipo}
                      </p>
                      <p className="text-[11px] text-ink-faint">{s.titular} · {fmtData(s.data)}</p>
                    </div>
                    {s.status === "concluida" ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-moss/12 px-2 py-0.5 text-[10.5px] font-bold text-moss"><Ic name="check" size={10} sw={3} /> OK</span>
                    ) : restante < 0 ? (
                      <span className="shrink-0 rounded-full bg-rust px-2 py-0.5 text-[10.5px] font-bold text-cream">Vencida</span>
                    ) : (
                      <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${restante <= 5 ? "bg-amber-soft text-ink" : "bg-paper-deep text-ink-soft"}`}>
                        <Ic name="clock" size={10} sw={2.4} /> {restante}d
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            <button onClick={() => irPara("lgpd-titulares")} className="group mt-auto inline-flex items-center gap-1.5 pt-4 text-[12px] font-bold text-moss transition hover:text-pine">
              Gerenciar fila <Ic name="arrow" size={12} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </Reveal>
      </div>

      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-sand bg-paper/60 px-5 py-3.5">
          <p className="text-[11.5px] text-ink-faint">
            “O controlador deve manter registro das operações de tratamento.” — <strong className="text-ink-soft">Art. 37, LGPD · Art. 30, GDPR</strong>
          </p>
          <p className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">Dados de demonstração · edite livremente</p>
        </div>
      </Reveal>
    </div>
  );
}
