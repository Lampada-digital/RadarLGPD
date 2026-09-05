import { useState } from "react";
import { TRIAL_DIAS, useAuth } from "../auth";
import type { PlanoConta } from "../auth";
import { useStore } from "../store";
import { fmtData } from "../domain";
import { Cabecalho, Ic, Reveal } from "./ui";

export const PLANOS_INFO: { id: Exclude<PlanoConta, "trial">; nome: string; preco: string; tagline: string; destaque?: boolean; recursos: string[] }[] = [
  {
    id: "standard",
    nome: "Standard",
    preco: "R$ 79,00",
    tagline: "Privacidade LGPD + GDPR no essencial.",
    recursos: ["LGPD ilimitado (art. 37)", "GDPR ilimitado (art. 30)", "Matriz de risco em tempo real", "Fila de titulares (15d/30d)", "Até 3 usuários"],
  },
  {
    id: "business",
    nome: "Business",
    preco: "R$ 149,00",
    tagline: "Frameworks, IA e documentos para auditoria.",
    destaque: true,
    recursos: ["Tudo do Standard", "ISO 27001·27002·27701 + SOC 2 + PCI-DSS", "Assistente de IA ilimitado", "Pacotes de políticas (PDF/MD)", "Até 10 usuários"],
  },
  {
    id: "completo",
    nome: "Completo",
    preco: "R$ 249,00",
    tagline: "Tudo, sem limite, para toda a organização.",
    recursos: ["Tudo do Business", "Usuários ilimitados", "Exportações e relatórios completos", "Prioridade em novos frameworks", "Suporte dedicado"],
  },
];

export function diasRestantesTrial(trialAte?: string): number {
  if (!trialAte) return 0;
  return Math.max(0, Math.ceil((new Date(trialAte).getTime() - Date.now()) / 86400000));
}

export default function Plans() {
  const { usuario, ativarPlano } = useAuth();
  const { toast, registrar } = useStore();
  const [ativando, setAtivando] = useState<string | null>(null);

  if (!usuario) return null;
  const dias = diasRestantesTrial(usuario.trialAte);

  const ativar = (id: Exclude<PlanoConta, "trial">, nome: string, preco: string) => {
    setAtivando(id);
    setTimeout(() => {
      ativarPlano(id);
      registrar("sistema", `Plano ${nome} ativado (${preco}/mês) por ${usuario.email}.`);
      toast(`Plano ${nome} ativo! Todas as ferramentas foram liberadas na hora.`);
      setAtivando(null);
    }, 1100);
  };

  return (
    <div>
      <Cabecalho
        kicker="Assinatura · licença mensal"
        titulo="Escolha seu plano"
        desc="Comece com 7 dias grátis e ative dentro do sistema quando quiser — as ferramentas são liberadas na hora, sem reinstalar nada."
      />

      {usuario.demo ? (
        <Reveal>
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-sand bg-cream px-5 py-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-paper-deep text-moss"><Ic name="spark" size={17} sw={2.2} /></span>
            <p className="text-[12.5px] leading-snug text-ink-soft">
              <strong className="text-ink">Conta de demonstração.</strong> Você já tem acesso completo e permanente. Ao criar uma conta real com e-mail corporativo, o ciclo comercial ({TRIAL_DIAS} dias grátis → plano pago) é aplicado.
            </p>
          </div>
        </Reveal>
      ) : usuario.plano !== "trial" ? (
        <Reveal>
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-moss/40 bg-moss/8 px-5 py-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-moss text-cream"><Ic name="check" size={17} sw={2.6} /></span>
            <p className="min-w-0 flex-1 text-[12.5px] leading-snug text-ink-soft">
              <strong className="text-ink">Assinatura ativa — plano {PLANOS_INFO.find((p) => p.id === usuario.plano)?.nome}.</strong>
              {usuario.planoAtivoEm ? ` Ativa desde ${fmtData(usuario.planoAtivoEm)}.` : ""} Você pode fazer upgrade a qualquer momento.
            </p>
          </div>
        </Reveal>
      ) : (
        <Reveal>
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-amber/60 bg-amber-soft/50 px-5 py-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-amber text-pine"><Ic name="clock" size={17} sw={2.2} /></span>
            <p className="min-w-0 flex-1 text-[12.5px] leading-snug text-ink-soft">
              <strong className="text-ink">Free trial — {dias} dia{dias !== 1 ? "s" : ""} restante{dias !== 1 ? "s" : ""}.</strong> Registros em modo visualização. Ative um plano abaixo para liberar tudo na hora.
            </p>
          </div>
        </Reveal>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {PLANOS_INFO.map((p, i) => {
          const ativo = usuario.plano === p.id;
          return (
            <Reveal key={p.id} delay={i * 80}>
              <div className={`relative flex h-full flex-col rounded-xl border-2 bg-cream p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_36px_-18px_rgba(19,46,38,0.4)] ${p.destaque ? "border-pine shadow-[0_16px_32px_-18px_rgba(19,46,38,0.45)]" : "border-sand"}`}>
                {p.destaque && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime px-3 py-1 text-[9.5px] font-extrabold tracking-[0.14em] text-pine uppercase">Mais vendido</span>
                )}
                {ativo && (
                  <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-moss px-3 py-1 text-[9.5px] font-extrabold tracking-[0.14em] text-cream uppercase">
                    <Ic name="check" size={9} sw={3.4} /> Ativo
                  </span>
                )}
                <p className="font-display text-[13px] font-extrabold tracking-[0.1em] uppercase" style={{ color: p.destaque ? "var(--color-moss)" : "var(--color-ink-soft)" }}>{p.nome}</p>
                <p className="mt-2 flex items-end gap-1">
                  <span className="font-display text-[38px] leading-none font-extrabold tracking-tight text-ink">{p.preco}</span>
                  <span className="pb-1 text-[12px] font-semibold text-ink-faint">/mês</span>
                </p>
                <p className="mt-1.5 text-[12px] text-ink-soft">{p.tagline}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {p.recursos.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-[12.5px] text-ink-soft">
                      <span className={`mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full ${p.destaque ? "bg-moss/12 text-moss" : "bg-paper-deep text-moss"}`}><Ic name="check" size={10} sw={3.2} /></span>
                      {r}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => ativar(p.id, p.nome, p.preco)}
                  disabled={ativo || ativando !== null || usuario.demo}
                  className={`group mt-5 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[13px] font-extrabold transition active:scale-[0.98] disabled:opacity-50 ${p.destaque ? "bg-pine text-lime hover:bg-pine-deep" : "border border-sand bg-cream text-ink-soft hover:border-moss hover:text-moss"}`}
                >
                  {ativando === p.id ? (<><span className="inline-block size-4 animate-spin rounded-full border-2 border-current/30 border-t-current" /> Processando…</>) : ativo ? "Plano atual" : usuario.plano === "trial" ? `Ativar ${p.nome}` : `Mudar para ${p.nome}`}
                  {ativando !== p.id && !ativo && <Ic name="arrow" size={14} className="transition-transform group-hover:translate-x-0.5" />}
                </button>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={120}>
        <p className="mt-6 rounded-lg border border-dashed border-sand bg-paper/70 px-5 py-3.5 text-center text-[11.5px] text-ink-faint">
          Ativação simulada para demonstração — em produção, conecte seu provedor de pagamento (Stripe, Mercado Pago, etc.) no ponto de ativação.
        </p>
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
      ativarPlano("business");
      registrar("sistema", "Assinatura Business ativada após fim do trial.");
      toast("Pagamento aprovado — acesso completo restabelecido. Bem-vindo(a) de volta!");
      setAtivando(false);
    }, 1200);
  };

  return (
    <div className="protegido grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
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
            Tudo que você construiu nos {TRIAL_DIAS} dias de trial continua guardado. Ative a assinatura para retomar exatamente de onde parou.
          </p>
        </div>
        <p className="text-[10.5px] font-semibold tracking-wide text-cream/40 uppercase">LGPD · GDPR · ISO · SOC 2 · PCI-DSS</p>
      </div>

      <div className="flex items-center justify-center bg-paper p-6 sm:p-10">
        <div className="anim-rise w-full max-w-[440px]">
          <p className="mb-1 text-[11px] font-bold tracking-[0.16em] text-rust uppercase">Trial de {TRIAL_DIAS} dias finalizado</p>
          <h2 className="font-display text-[28px] leading-tight font-extrabold tracking-tight text-ink">Continue com um plano</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            Olá, <strong className="text-ink">{usuario?.nome}</strong>. Seu acesso foi pausado em <strong className="text-ink">{usuario?.empresa}</strong> — ative para liberar tudo novamente.
          </p>
          <div className="mt-5 rounded-xl border border-pine-line bg-pine p-5 text-cream">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-lime uppercase">Plano Business</p>
                <p className="font-display mt-1.5 text-[40px] leading-none font-extrabold text-lime">R$ 149,00<span className="ml-1 text-[14px] font-bold text-cream/60">/mês</span></p>
              </div>
              <span className="rounded-full bg-pine-deep px-2.5 py-1 text-[9.5px] font-extrabold tracking-widest text-lime uppercase">Mais vendido</span>
            </div>
            <ul className="mt-4 space-y-1.5">
              {["LGPD + GDPR ilimitados", "ISO + SOC 2 + PCI-DSS", "IA, PDFs e exportações", "Até 10 usuários"].map((b) => (
                <li key={b} className="flex items-center gap-2 text-[12px] text-cream/85">
                  <span className="grid size-4 shrink-0 place-items-center rounded-full bg-lime/20 text-lime"><Ic name="check" size={9} sw={3.2} /></span>
                  {b}
                </li>
              ))}
            </ul>
            <button onClick={ativar} disabled={ativando} className="group mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-lime py-3 text-[14px] font-extrabold text-pine transition hover:bg-lime-soft active:scale-[0.99] disabled:opacity-70">
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
