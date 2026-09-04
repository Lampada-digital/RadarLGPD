import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../auth";
import { LIMITES_DEMO } from "../planos";
import { Ic, Modal } from "./ui";

/* Contexto global: qualquer página pode abrir o modal de upgrade */
const UpCtx = createContext<{ abrir: () => void }>({ abrir: () => {} });
export const useUpgrade = () => useContext(UpCtx);

export function UpgradeProvider({ children }: { children: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  return (
    <UpCtx.Provider value={{ abrir: () => setAberto(true) }}>
      {children}
      <Modal aberto={aberto} onFechar={() => setAberto(false)} titulo="Planos do Radar GRC" largura="max-w-3xl">
        <Conteudo onFechar={() => setAberto(false)} />
      </Modal>
    </UpCtx.Provider>
  );
}

function PlanoCard({ nome, preco, atual, destaque, itens, acao }: { nome: string; preco: string; atual?: boolean; destaque?: boolean; itens: { t: string; ok: boolean }[]; acao?: ReactNode }) {
  return (
    <div className={`relative flex flex-col rounded-lg border p-4.5 transition ${destaque ? "border-pine bg-pine text-cream shadow-[0_18px_40px_-18px_rgba(12,31,24,0.55)]" : "border-sand bg-paper"}`}>
      {atual && (
        <span className={`absolute -top-2.5 right-3 rounded-full px-2.5 py-0.5 text-[9.5px] font-extrabold tracking-widest uppercase ${destaque ? "bg-lime text-pine" : "bg-moss text-cream"}`}>Seu plano</span>
      )}
      <p className={`text-[10px] font-extrabold tracking-[0.16em] uppercase ${destaque ? "text-lime" : "text-moss"}`}>{nome}</p>
      <p className={`font-display mt-1.5 text-[26px] leading-none font-extrabold ${destaque ? "text-cream" : "text-ink"}`}>{preco}</p>
      <ul className="mt-4 flex-1 space-y-2">
        {itens.map((i) => (
          <li key={i.t} className={`flex items-start gap-2 text-[12px] leading-snug ${destaque ? "text-cream/85" : "text-ink-soft"}`}>
            <span className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full ${i.ok ? (destaque ? "bg-lime text-pine" : "bg-moss text-cream") : destaque ? "bg-pine-deep text-cream/30" : "bg-paper-deep text-ink-faint"}`}>
              <Ic name={i.ok ? "check" : "x"} size={9} sw={3.2} />
            </span>
            {i.t}
          </li>
        ))}
      </ul>
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}

function Conteudo({ onFechar }: { onFechar: () => void }) {
  const { usuario, ativarTrial } = useAuth();
  const admin = usuario?.papel === "admin";
  const pro = admin || usuario?.plano === "pro";
  const trialAte = usuario?.trialAte ? new Date(usuario.trialAte) : null;
  const diasTrial = trialAte ? Math.max(0, Math.ceil((trialAte.getTime() - Date.now()) / 86400000)) : 0;
  const [ativado, setAtivado] = useState(false);

  const itensDemo = [
    { t: `${LIMITES_DEMO.atividades} atividades LGPD (art. 37)`, ok: true },
    { t: `${LIMITES_DEMO.gdpr} operações no ROPA (Art. 30)`, ok: true },
    { t: "2 frameworks ISO (27001 e 27701)", ok: true },
    { t: "Assistente IA e matriz de risco", ok: true },
    { t: "Políticas em PDF (rascunho)", ok: true },
    { t: "Exportação CSV / JSON", ok: false },
    { t: "PDF CONTROLADO e os 7 frameworks", ok: false },
  ];
  const itensPro = [
    { t: "Atividades LGPD e ROPA ilimitados", ok: true },
    { t: "Todos os 7 frameworks ISO", ok: true },
    { t: "Políticas em PDF CONTROLADO", ok: true },
    { t: "Exportação completa (CSV/JSON)", ok: true },
    { t: "Trilha de auditoria sem limites", ok: true },
    { t: "Suporte prioritário", ok: true },
  ];

  return (
    <div>
      {admin ? (
        <div className="mb-4 flex items-start gap-2.5 rounded-md border border-pine-line bg-pine px-4 py-3 text-[12.5px] text-cream">
          <Ic name="shield" size={15} className="mt-0.5 shrink-0 text-lime" sw={2.2} />
          <p><strong className="text-lime">Acesso administrativo</strong> — todos os recursos estão liberados, incluindo o painel de gestão de usuários e planos.</p>
        </div>
      ) : pro ? (
        <div className="mb-4 flex items-start gap-2.5 rounded-md border border-moss/40 bg-moss/10 px-4 py-3 text-[12.5px] text-ink-soft">
          <Ic name="check" size={15} className="mt-0.5 shrink-0 text-moss" sw={2.4} />
          <p>
            <strong className="text-moss">Plano Pro ativo.</strong>{" "}
            {usuario?.trialAte ? `Trial válido por mais ${diasTrial} dia${diasTrial !== 1 ? "s" : ""} (até ${trialAte!.toLocaleDateString("pt-BR")}). Fale com o administrador para converter em assinatura.` : "Todos os recursos liberados."}
          </p>
        </div>
      ) : null}

      <div className="grid gap-3.5 md:grid-cols-3">
        <PlanoCard
          nome="Demo"
          preco="R$ 0"
          atual={!pro}
          itens={itensDemo}
          acao={
            <button disabled className="w-full rounded-md border border-sand px-3 py-2 text-[12.5px] font-bold text-ink-faint" >
              {pro ? "Plano básico" : "Plano atual"}
            </button>
          }
        />
        <PlanoCard
          nome="Profissional"
          preco="R$ 149/mês"
          atual={pro}
          destaque
          itens={itensPro}
          acao={
            !admin && !pro ? (
              ativado ? (
                <button disabled className="w-full rounded-md bg-lime px-3 py-2 text-[12.5px] font-extrabold text-pine">
                  ✓ Trial ativado — 14 dias
                </button>
              ) : (
                <button
                  onClick={() => { ativarTrial(); setAtivado(true); }}
                  className="w-full rounded-md bg-lime px-3 py-2 text-[12.5px] font-extrabold text-pine transition hover:bg-lime-soft active:scale-[0.98]"
                >
                  Ativar trial grátis — 14 dias
                </button>
              )
            ) : pro ? (
              <button disabled className="w-full rounded-md bg-lime/15 px-3 py-2 text-[12.5px] font-bold text-lime">
                Recursos liberados
              </button>
            ) : undefined
          }
        />
        <PlanoCard
          nome="Enterprise"
          preco="Sob consulta"
          itens={[
            { t: "Tudo do Profissional", ok: true },
            { t: "Usuários ilimitados + SSO", ok: true },
            { t: "Relatórios white-label", ok: true },
            { t: "DPO as a service incluso", ok: true },
            { t: "SLA e auditoria dedicada", ok: true },
          ]}
          acao={
            <a href="mailto:contato@radargrc.app" className="block w-full rounded-md bg-pine px-3 py-2 text-center text-[12.5px] font-bold text-lime transition hover:bg-pine-deep active:scale-[0.98]">
              Falar com vendas
            </a>
          }
        />
      </div>
      <p className="mt-4 text-center text-[10.5px] text-ink-faint">
        Demonstração local: o trial é ativado instantaneamente neste navegador. Em produção, o upgrade passa pelo administrador ou pelo checkout.
      </p>
      <div className="mt-3 flex justify-end">
        <button onClick={onFechar} className="rounded-md border border-sand px-4 py-2 text-[12.5px] font-semibold text-ink-soft transition hover:bg-paper">
          Entendi, continuar no plano atual
        </button>
      </div>
    </div>
  );
}
