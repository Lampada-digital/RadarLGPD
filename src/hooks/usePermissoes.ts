import { useAuth } from "../auth";
import { verificarPermissao, verificarFramework } from "../lib/planos";

export function usePermissoes() {
  const { usuario } = useAuth();

  // Funções permitidas para conta demo
  const FUNCOES_DEMO = ["dashboard", "planos"];

  const temAcesso = (funcionalidade: string): boolean => {
    if (!usuario) return false;
    
    // Conta demo tem acesso apenas a dashboard e planos
    if (usuario.demo === true) {
      return FUNCOES_DEMO.includes(funcionalidade);
    }
    
    return verificarPermissao(usuario.plano, funcionalidade);
  };

  const temFramework = (frameworkId: string): boolean => {
    if (!usuario) return false;
    
    // Conta demo não tem acesso a frameworks
    if (usuario.demo === true) {
      return false;
    }
    
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
