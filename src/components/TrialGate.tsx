import { useAuth } from "../auth";
import { PLANOS } from "../lib/planos";
import { Ic } from "./ui";

export default function TrialGate() {
  const { usuario, ativarPlano } = useAuth();

  if (!usuario) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-paper to-paper-deep p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber/20">
            <Ic name="clock" size={32} className="text-amber" />
          </div>
          <h1 className="font-display text-[32px] font-extrabold text-ink">Seu período de teste expirou</h1>
          <p className="mt-2 text-[15px] text-ink-soft">Escolha um plano para continuar usando o Radar GRC</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {Object.values(PLANOS).map((plano) => (
            <div key={plano.id} className={`relative flex flex-col rounded-xl border-2 bg-cream p-6 ${plano.id === "business" ? "border-pine shadow-lg" : "border-sand"}`}>
              {plano.id === "business" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime px-3 py-1 text-[10px] font-extrabold tracking-widest text-pine uppercase">
                  Mais Popular
                </div>
              )}
              
              <h3 className="font-display text-[18px] font-extrabold text-ink">{plano.nome}</h3>
              <p className="mt-1 text-[12px] text-ink-soft">{plano.descricao}</p>

              <div className="my-4">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-[36px] font-extrabold text-ink">R$ {plano.preco}</span>
                  <span className="text-[14px] text-ink-soft">/mês</span>
                </div>
                <p className="mt-2 text-[11px] text-ink-soft">7 dias grátis</p>
              </div>

              <ul className="mb-6 flex-1 space-y-2">
                {plano.recursos.slice(0, 5).map((recurso, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-ink-soft">
                    <Ic name="check" size={14} sw={2.6} className="mt-0.5 shrink-0 text-moss" />
                    <span>{recurso}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (confirm(`Confirmar ativação do plano ${plano.nome} por R$ ${plano.preco}/mês?`)) {
                    ativarPlano(plano.id);
                  }
                }}
                className={`w-full rounded-md py-3 text-[13px] font-bold transition ${
                  plano.id === "business"
                    ? "bg-pine text-lime hover:bg-pine-deep"
                    : "border border-sand bg-cream text-ink hover:border-moss hover:text-moss"
                }`}
              >
                Ativar Plano
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-[12px] text-ink-soft">
            Precisa de ajuda? <a href="mailto:suporte@radargrc.com" className="font-bold text-moss hover:underline">Entre em contato</a>
          </p>
        </div>
      </div>
    </div>
  );
}
