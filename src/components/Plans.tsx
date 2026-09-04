import { useState } from "react";
import { PRECO_MENSAL, TRIAL_DIAS, useAuth } from "../auth";
import { useStore } from "../store";
import { fmtData } from "../types";
import { Cabecalho, Ic, Reveal, Ring } from "./ui";

export function diasRestantesTrial(trialAte?: string): number {
  if (!trialAte) return 0;
  return Math.max(0, Math.ceil((new Date(trialAte).getTime() - Date.now()) / 86400000));
}

const INCLUSO = [
  { ic: "layers", t: "LGPD completo", d: "Registro art. 37, matriz 5×5, bases legais e fila de titulares (15 dias)." },
  { ic: "globe", t: "GDPR completo", d: "ROPA Art. 30, bases Art. 6/9, DPIA (WP248) e transferências do Capítulo V." },
  { ic: "brain", t: "12 frameworks & certificações", d: "ISO 27001, 27002, 27017, 27701, 22301, 31000, 37001, 37301, SOC 2, PCI-DSS, IA e Cookies." },
  { ic: "spark", t: "Assistente de IA ilimitado", d: "Classificação de operações, planos de implementação e diagnósticos — 100% no navegador." },
  { ic: "printer", t: "Documentos e políticas em PDF", d: "Pacotes CONTROLADOS prontos para auditoria e certificação, sem limite de geração." },
  { ic: "user", t: "Usuários ilimitados", d: "Painel administrativo para criar, bloquear e excluir a equipe da organização." },
  { ic: "shield", t: "Segurança e auditoria", d: "Trilha completa de eventos, bloqueio anti força-bruta e script de hardening." },
  { ic: "download", t: "Exportações sem limite", d: "JSON, CSV e Markdown de todos os registros, a qualquer momento." },
];

const FAQ = [
  { q: "Como funciona o free trial?", a: `Ao criar sua conta você recebe ${TRIAL_DIAS} dias de acesso completo, sem cartão de crédito. Ao final do período, o acesso é pausado até a ativação da assinatura — todos os seus dados são preservados.` },
  { q: "Como ativo a assinatura?", a: `Clique em "Ativar plano completo" na página de Assinatura. A cobrança de ${PRECO_MENSAL}/mês é processada com segurança e o acesso é restabelecido imediatamente. Cancele quando quiser.` },
  { q: "Perco meus dados se o trial acabar?", a: "Não. Mapeamentos, registros, evidências e relatórios ficam guardados e voltam a ficar acessíveis assim que a assinatura é ativada." },
];

function ChipPlano({ usuario }: { usuario: NonNullable<ReturnType<typeof useAuth>["usuario"]> }) {
  if (usuario.demo) return <span className="rounded-full bg-paper-deep px-3 py-1 text-[11px] font-extrabold tracking-wide text-ink-soft uppercase">Demonstração · acesso permanente</span>;
  if (usuario.plano === "completo")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-moss/12 px-3 py-1 text-[11px] font-extrabold tracking-wide text-moss uppercase">
        <Ic name="check" size={11} sw={3} /> Assinatura ativa{usuario.planoAtivoEm ? ` desde ${fmtData(usuario.planoAtivoEm)}` : ""}
      </span>
    );
  const d = diasRestantesTrial(usuario.trialAte);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wide uppercase ${d > 0 ? "bg-amber-soft text-ink" : "bg-rust-soft text-rust"}`}>
      <Ic name="clock" size={11} sw={2.6} /> {d > 0 ? `Free trial · ${d} dia${d > 1 ? "s" : ""} restante${d > 1 ? "s" : ""}` : "Trial encerrado"}
    </span>
  );
}

export default function Plans() {
  const { usuario, ativarPlano } = useAuth();
  const { toast, registrar } = useStore();
  const [ativando, setAtivando] = useState(false);

  if (!usuario) return null;
  const dias = diasRestantesTrial(usuario.trialAte);
  const completo = usuario.plano === "completo";
  const pctTrial = Math.round((dias / TRIAL_DIAS) * 100);

  const ativar = () => {
    setAtivando(true);
    setTimeout(() => {
      ativarPlano();
      registrar("sistema", `Assinatura Completa ativada (${PRECO_MENSAL}/mês) por ${usuario.email}.`);
      toast(`Assinatura Completa ativa! Bem-vindo(a) ao Radar GRC — cobrança de ${PRECO_MENSAL}/mês iniciada.`);
      setAtivando(false);
    }, 1100);
  };

  return (
    <div>
      <Cabecalho
        kicker="Assinatura · licença única"
        titulo="Plano Completo"
        desc="Um único plano com absolutamente tudo — LGPD, GDPR, 12 frameworks, IA, documentos e equipe ilimitada. Comece com 7 dias grátis, sem cartão."
      />

      {/* card principal de preço */}
      <Reveal>
        <div className="rail-texture relative overflow-hidden rounded-xl border border-pine-line bg-pine text-cream">
          <div className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full border border-lime/15" />
          <div className="pointer-events-none absolute -top-10 -right-8 size-44 rounded-full border border-lime/20">
            <div className="radar-sweep absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, rgba(201,233,79,0.22), transparent 70deg)" }} />
          </div>
          <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full bg-lime px-2.5 py-1 text-[10px] font-extrabold tracking-[0.14em] text-pine uppercase">Tudo incluído · sem limites</span>
                <ChipPlano usuario={usuario} />
              </div>
              <h2 className="font-display mt-4 text-[30px] leading-none font-extrabold tracking-tight sm:text-[36px]">
                Radar GRC <span className="text-lime">Completo</span>
              </h2>
              <p className="mt-4 flex items-end gap-2">
                <span className="font-display text-[54px] leading-none font-extrabold text-lime">{PRECO_MENSAL}</span>
                <span className="pb-2 text-[13px] font-semibold text-cream/60">/mês · cancele quando quiser</span>
              </p>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {["Free trial de 7 dias (sem cartão)", "Usuários e organizações ilimitados", "Documentos PDF ilimitados", "Atualizações e suporte incluídos"].map((b) => (
                  <li key={b} className="flex items-center gap-2 text-[12.5px] text-cream/85">
                    <span className="grid size-4.5 shrink-0 place-items-center rounded-full bg-lime/20 text-lime"><Ic name="check" size={10} sw={3.2} /></span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* estado da assinatura + CTA */}
            <div className="flex flex-col justify-between rounded-lg border border-pine-line bg-pine-deep/70 p-5">
              {usuario.demo ? (
                <div>
                  <p className="text-[10.5px] font-bold tracking-[0.16em] text-lime uppercase">Conta de demonstração</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-cream/80">
                    Esta conta possui acesso permanente para você conhecer o sistema. Ao cadastrar sua própria conta com e-mail corporativo, o ciclo comercial real é aplicado: <strong className="text-lime">{TRIAL_DIAS} dias grátis</strong> e depois <strong className="text-lime">{PRECO_MENSAL}/mês</strong>.
                  </p>
                </div>
              ) : completo ? (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Ring value={100} size={92} stroke={8} cor="var(--color-lime)" />
                    <span className="absolute inset-0 grid place-items-center"><Ic name="check" size={26} sw={3} className="text-lime" /></span>
                  </div>
                  <div>
                    <p className="font-display text-[17px] font-extrabold text-cream">Assinatura ativa</p>
                    <p className="mt-1 text-[11.5px] leading-snug text-cream/60">
                      {usuario.planoAtivoEm ? `Ativa desde ${fmtData(usuario.planoAtivoEm)}. ` : ""}Próxima cobrança: {PRECO_MENSAL} em 30 dias. Gerencie ou cancele a qualquer momento.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10.5px] font-bold tracking-[0.16em] text-amber uppercase">Free trial em andamento</p>
                    <span className="font-display text-[22px] font-extrabold text-cream">{dias}<span className="text-[12px] text-cream/50">/{TRIAL_DIAS} dias</span></span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-pine-line">
                    <div className="bar-grow h-full rounded-full bg-amber transition-all duration-700" style={{ width: `${pctTrial}%` }} />
                  </div>
                  <p className="mt-2.5 text-[11.5px] leading-snug text-cream/60">
                    {dias > 0 ? `Acesso total liberado até ${usuario.trialAte ? fmtData(usuario.trialAte) : "o fim do período"}. Sem cartão de crédito.` : "Seu período de avaliação terminou — ative para continuar."}
                  </p>
                </div>
              )}

              {!usuario.demo && !completo && (
                <button
                  onClick={ativar}
                  disabled={ativando}
                  className="group mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-lime px-5 py-3 text-[14px] font-extrabold text-pine shadow-[0_14px_30px_-14px_rgba(201,233,79,0.6)] transition hover:bg-lime-soft active:scale-[0.98] disabled:opacity-70"
                >
                  {ativando ? (
                    <><span className="inline-block size-4 animate-spin rounded-full border-2 border-pine/30 border-t-pine" /> Processando pagamento…</>
                  ) : (
                    <>{dias > 0 ? "Ativar plano agora" : "Ativar plano completo"} <Ic name="arrow" size={15} className="transition-transform group-hover:translate-x-0.5" /></>
                  )}
                </button>
              )}
              {!usuario.demo && completo && (
                <p className="mt-5 rounded-md border border-pine-line bg-pine px-3.5 py-2.5 text-[11px] leading-snug text-cream/55">
                  <Ic name="shield" size={11} sw={2.4} className="mr-1 inline text-lime" />
                  Pagamento processado com criptografia de ponta a ponta. Nota fiscal enviada ao e-mail da conta.
                </p>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {/* o que está incluído */}
      <Reveal delay={80}>
        <p className="mt-6 mb-2.5 text-[11px] font-bold tracking-[0.16em] text-moss uppercase">Um plano, tudo dentro</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {INCLUSO.map((f, i) => (
            <Reveal key={f.t} delay={i * 45}>
              <div className="group h-full rounded-lg border border-sand bg-cream p-4 transition-all duration-200 hover:-translate-y-1 hover:border-moss/50 hover:shadow-[0_14px_30px_-18px_rgba(19,46,38,0.45)]">
                <span className="grid size-9 place-items-center rounded-md bg-paper-deep text-moss transition group-hover:bg-pine group-hover:text-lime">
                  <Ic name={f.ic} size={17} sw={2} />
                </span>
                <p className="font-display mt-3 text-[13.5px] leading-tight font-bold text-ink">{f.t}</p>
                <p className="mt-1 text-[11px] leading-snug text-ink-soft">{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {/* FAQ */}
      <Reveal delay={120}>
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {FAQ.map((f) => (
            <div key={f.q} className="rounded-lg border border-dashed border-sand bg-paper/70 p-4">
              <p className="font-display flex items-center gap-2 text-[13px] font-bold text-ink"><Ic name="spark" size={13} sw={2.4} className="text-moss" /> {f.q}</p>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-soft">{f.a}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

/* ---------------- trava ao fim do trial ---------------- */

export function TrialGate() {
  const { usuario, ativarPlano, sair } = useAuth();
  const { toast, registrar } = useStore();
  const [ativando, setAtivando] = useState(false);

  const ativar = () => {
    setAtivando(true);
    setTimeout(() => {
      ativarPlano();
      registrar("sistema", `Assinatura Completa ativada após fim do trial (${PRECO_MENSAL}/mês).`);
      toast("Pagamento aprovado — acesso completo restabelecido. Bem-vindo(a) de volta!");
      setAtivando(false);
    }, 1200);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="rail-texture relative hidden flex-col justify-between overflow-hidden bg-pine p-10 lg:flex">
        <div className="pointer-events-none absolute -bottom-24 -left-20 size-80 rounded-full border border-lime/12" />
        <div className="flex items-center gap-3">
          <span className="relative grid size-10 place-items-center overflow-hidden rounded-lg border border-lime/40 bg-pine-deep">
            <span className="radar-sweep absolute inset-0" style={{ background: "conic-gradient(from 0deg, rgba(201,233,79,0.35), transparent 75deg)" }} />
            <Ic name="radar" size={21} className="relative text-lime" sw={1.9} />
          </span>
          <span className="font-display text-[17px] font-extrabold tracking-tight text-cream">Radar<span className="text-lime">GRC</span></span>
        </div>
        <div className="max-w-md">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber/40 bg-pine-deep/60 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-amber uppercase">
            <Ic name="clock" size={11} sw={2.4} /> Período de avaliação encerrado
          </p>
          <h1 className="font-display text-[38px] leading-[1.05] font-extrabold tracking-tight text-cream">
            Seu mapa de dados está <span className="text-lime">seguro e intacto.</span>
          </h1>
          <p className="mt-4 text-[13.5px] leading-relaxed text-cream/70">
            Todos os mapeamentos, evidências, políticas e registros criados nos seus {TRIAL_DIAS} dias de trial continuam guardados. Ative a assinatura para retomar exatamente de onde parou.
          </p>
        </div>
        <p className="text-[10.5px] font-semibold tracking-wide text-cream/40 uppercase">LGPD · GDPR · 12 frameworks · IA</p>
      </div>

      <div className="flex items-center justify-center bg-paper p-6 sm:p-10">
        <div className="anim-rise w-full max-w-[440px]">
          <p className="mb-1 text-[11px] font-bold tracking-[0.16em] text-rust uppercase">Trial de {TRIAL_DIAS} dias finalizado</p>
          <h2 className="font-display text-[28px] leading-tight font-extrabold tracking-tight text-ink">Continue com o plano Completo</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            Olá, <strong className="text-ink">{usuario?.nome}</strong>. Seu acesso foi pausado em <strong className="text-ink">{usuario?.empresa}</strong> — ative a assinatura para liberar tudo novamente.
          </p>

          <div className="mt-5 rounded-xl border border-pine-line bg-pine p-5 text-cream">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-lime uppercase">Plano Completo</p>
                <p className="font-display mt-1.5 text-[40px] leading-none font-extrabold text-lime">{PRECO_MENSAL}<span className="ml-1 text-[14px] font-bold text-cream/60">/mês</span></p>
              </div>
              <span className="rounded-full bg-pine-deep px-2.5 py-1 text-[9.5px] font-extrabold tracking-widest text-lime uppercase">Tudo incluído</span>
            </div>
            <ul className="mt-4 space-y-1.5">
              {["LGPD + GDPR + 12 frameworks", "IA, PDFs e exportações ilimitados", "Usuários e painel administrativo", "Cancele quando quiser"].map((b) => (
                <li key={b} className="flex items-center gap-2 text-[12px] text-cream/85">
                  <span className="grid size-4 shrink-0 place-items-center rounded-full bg-lime/20 text-lime"><Ic name="check" size={9} sw={3.2} /></span>
                  {b}
                </li>
              ))}
            </ul>
            <button
              onClick={ativar}
              disabled={ativando}
              className="group mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-lime py-3 text-[14px] font-extrabold text-pine transition hover:bg-lime-soft active:scale-[0.99] disabled:opacity-70"
            >
              {ativando ? (<><span className="inline-block size-4 animate-spin rounded-full border-2 border-pine/30 border-t-pine" /> Processando…</>) : (<>Ativar assinatura agora <Ic name="arrow" size={15} className="transition-transform group-hover:translate-x-0.5" /></>)}
            </button>
            <p className="mt-2.5 text-center text-[10px] text-cream/50">Pagamento seguro · ativação imediata · demonstração de checkout</p>
          </div>

          <button onClick={sair} className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-sand py-2.5 text-[12.5px] font-bold text-ink-soft transition hover:border-rust hover:text-rust">
            <Ic name="x" size={13} sw={2.4} /> Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
