import { useAuth } from "./auth";

/* ============ Limites por plano (modelo freemium) ============ */

export const LIMITES_DEMO = {
  atividades: 5,
  gdpr: 3,
  isoFrameworks: ["iso27001", "iso27701"],
  auditoria: 25,
  export: false,
  pdfOficial: false,
};

export function usePlano() {
  const { usuario } = useAuth();
  const admin = usuario?.papel === "admin";
  const pro = admin || usuario?.plano === "pro";
  const trial = !admin && usuario?.plano === "pro" && !!usuario?.trialAte;
  const diasTrial = trial && usuario?.trialAte ? Math.max(0, Math.ceil((new Date(usuario.trialAte).getTime() - Date.now()) / 86400000)) : 0;
  return {
    plano: usuario?.plano ?? "demo",
    admin,
    pro,
    trial,
    diasTrial,
    limites: pro ? null : LIMITES_DEMO,
    podeExportar: pro,
    podePdfOficial: pro,
    isoLiberada: (id: string) => pro || LIMITES_DEMO.isoFrameworks.includes(id),
  };
}
