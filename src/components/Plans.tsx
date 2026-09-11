import { useState } from "react";
import { TRIAL_DIAS, useAuth } from "../auth";
import type { PlanoConta } from "../auth";
import { useStore } from "../store";
import { fmtData } from "../domain";
import { Cabecalho, Ic, Reveal } from "./ui";
import { PLANOS } from "../lib/planos";

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

  const ativar = (planoId: "standard" | "business" | "completo") => {
    const plano = PLANOS[planoId];
    // Abrir link de pagamento do Mercado Pago
    window.open(plano.linkPagamento, "_blank", "noopener,noreferrer");
    
    setAtivando(planoId);
    setTimeout(() => {
      ativarPlano(planoId);
      registrar("sistema", `Plano ${plano.nome} ativado (R$ ${plano.preco}/mês) por ${usuario.email}.`);
      toast(`Plano ${plano.nome} ativo! Todas as ferramentas foram liberadas.`);
      setAtivando(null);
    }, 1100);
  };

  return (
    <div>
      <Cabecalho
        kicker="Assinatura · licença mensal"
        titulo="Escolha seu plano"
        desc="Comece com 7 dias grátis. Cada plano tem recursos específicos para sua necessidade."
      />

      {usuario.demo ? (
        <Reveal>
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-amber/60 bg-amber-soft/50 px-5 py-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-amber text-pine"><Ic name="lock" size={17} sw={2.2} /></span>
            <div className="flex-1">
              <p className="text-[12.5px] leading-snug text-ink-soft">
                <strong className="text-ink">Conta de demonstração limitada.</strong> Esta conta tem acesso apenas ao dashboard. Para acessar todas as funcionalidades, escolha um plano abaixo.
              </p>
            </div>
          </div>
        </Reveal>
      ) : usuario.plano !== "trial" ? (
        <Reveal>
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-moss/40 bg-moss/8 px-5 py-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-moss text-cream"><Ic name="check" size={17} sw={2.6} /></span>
            <p className="min-w-0 flex-1 text-[12.5px] leading-snug text-ink-soft">
              <strong className="text-ink">Assinatura ativa — {PLANOS[usuario.plano as keyof typeof PLANOS]?.nome || "Plano ativo"}.</strong>
              {usuario.planoAtivoEm ? ` Ativa desde ${fmtData(usuario.planoAtivoEm)}.` : ""}
            </p>
          </div>
        </Reveal>
      ) : (
        <Reveal>
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-amber/60 bg-amber-soft/50 px-5 py-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-amber text-pine"><Ic name="clock" size={17} sw={2.2} /></span>
            <p className="min-w-0 flex-1 text-[12.5px] leading-snug text-ink-soft">
              <strong className="text-ink">Free trial — {dias} dia{dias !== 1 ? "s" : ""} restante{dias !== 1 ? "s" : ""}.</strong> Escolha um plano abaixo para continuar usando o sistema.
            </p>
          </div>
        </Reveal>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {Object.values(PLANOS).map((plano, i) => {
          const ativo = usuario.plano === plano.id;
          return (
            <Reveal key={plano.id} delay={i * 80}>
              <div className={`relative flex h-full flex-col rounded-xl border-2 bg-cream p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_36px_-18px_rgba(19,46,38,0.4)] ${plano.id === "business" ? "border-pine shadow-[0_16px_32px_-18px_rgba(19,46,38,0.45)]" : "border-sand"}`}>
                {plano.id === "business" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime px-3 py-1 text-[10px] font-extrabold tracking-widest text-pine uppercase shadow">
                    Mais Popular
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="font-display text-[18px] font-extrabold text-ink">{plano.nome}</h3>
                  <p className="mt-1 text-[12px] text-ink-soft">{plano.descricao}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-[36px] font-extrabold text-ink">R$ {plano.preco}</span>
                    <span className="text-[14px] text-ink-soft">/mês</span>
                  </div>
                  <p className="mt-2 text-[11px] text-ink-soft">7 dias grátis</p>
                </div>

                <ul className="mb-6 flex-1 space-y-2.5">
                  {plano.recursos.map((recurso, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-[12.5px] text-ink-soft">
                      <Ic name="check" size={16} sw={2.6} className="mt-0.5 shrink-0 text-moss" />
                      <span>{recurso}</span>
                    </li>
                  ))}
                </ul>

                <div className="mb-4 rounded-lg border border-sand bg-paper p-3">
                  <p className="text-[11px] font-bold text-ink-soft uppercase">Período de teste grátis</p>
                  <p className="text-[13px] font-bold text-ink">7 dias grátis</p>
                  <p className="mt-1 text-[11px] text-ink-soft">Dia da cobrança: No dia da adesão</p>
                </div>

                <button
                  onClick={() => !ativo && ativar(plano.id)}
                  disabled={ativo || ativando === plano.id}
                  className={`w-full rounded-md py-3 text-[13px] font-bold transition ${
                    ativo
                      ? "bg-moss text-cream cursor-default"
                      : ativando === plano.id
                      ? "bg-amber text-pine cursor-wait"
                      : plano.id === "business"
                      ? "bg-pine text-lime hover:bg-pine-deep"
                      : "border border-sand bg-cream text-ink hover:border-moss hover:text-moss"
                  }`}
                >
                  {ativo ? "✓ Plano Ativo" : ativando === plano.id ? "Ativando..." : "Escolher Plano"}
                </button>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={300}>
        <div className="mt-8 rounded-lg border border-sand bg-cream p-5">
          <h3 className="font-display text-[16px] font-bold text-ink mb-3">Links de Pagamento</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <a href={PLANOS.standard.linkPagamento} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md border border-sand bg-paper p-3 transition hover:border-moss hover:bg-moss/5">
              <Ic name="doc" size={18} className="text-moss" />
              <div>
                <p className="text-[12px] font-bold text-ink">RADAR GRC STANDARD</p>
                <p className="text-[11px] text-ink-soft">R$ {PLANOS.standard.preco}/mês</p>
              </div>
            </a>
            <a href={PLANOS.business.linkPagamento} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md border border-sand bg-paper p-3 transition hover:border-moss hover:bg-moss/5">
              <Ic name="doc" size={18} className="text-moss" />
              <div>
                <p className="text-[12px] font-bold text-ink">RADAR GRC BUSINESS</p>
                <p className="text-[11px] text-ink-soft">R$ {PLANOS.business.preco}/mês</p>
              </div>
            </a>
            <a href={PLANOS.completo.linkPagamento} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md border border-sand bg-paper p-3 transition hover:border-moss hover:bg-moss/5">
              <Ic name="doc" size={18} className="text-moss" />
              <div>
                <p className="text-[12px] font-bold text-ink">RADAR GRC COMPLETO</p>
                <p className="text-[11px] text-ink-soft">R$ {PLANOS.completo.preco}/mês</p>
              </div>
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
