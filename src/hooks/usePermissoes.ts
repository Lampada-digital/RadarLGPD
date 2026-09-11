import { useAuth } from "../auth";
import { verificarPermissao, verificarFramework } from "../lib/planos";

export function usePermissoes() {
  const { usuario } = useAuth();

  const temAcesso = (funcionalidade: string): boolean => {
    if (!usuario) return false;
    return verificarPermissao(usuario.plano, funcionalidade);
  };

  const temFramework = (frameworkId: string): boolean => {
    if (!usuario) return false;
    return verificarFramework(usuario.plano, frameworkId);
  };

  const isDemo = usuario?.demo === true;
  const isTrial = usuario?.plano === "trial";
  const isPago = !isDemo && !isTrial;

  return {
    temAcesso,
    temFramework,
    isDemo,
    isTrial,
    isPago,
    plano: usuario?.plano
  };
}
