/* Sistema de permissões por plano */

export type PlanoId = "standard" | "business" | "completo";

export interface PlanoConfig {
  id: PlanoId;
  nome: string;
  preco: number;
  descricao: string;
  recursos: string[];
  limites: {
    usuarios: number; // -1 = ilimitado
    exportacoes: boolean;
    relatorios: boolean;
    frameworks: string[]; // IDs dos frameworks permitidos
    funcionalidades: string[]; // IDs das funcionalidades permitidas
  };
}

export const PLANOS: Record<PlanoId, PlanoConfig> = {
  standard: {
    id: "standard",
    nome: "RADAR GRC STANDARD",
    preco: 79,
    descricao: "Privacidade LGPD + GDPR no essencial.",
    recursos: [
      "LGPD ilimitado (art. 37)",
      "GDPR ilimitado (art. 30)",
      "Matriz de risco em tempo real",
      "Fila de titulares (15d/30d)",
      "Até 3 usuários"
    ],
    limites: {
      usuarios: 3,
      exportacoes: false,
      relatorios: false,
      frameworks: ["iso27001"], // Apenas ISO 27001 básico
      funcionalidades: [
        "dashboard",
        "lgpd-registro",
        "lgpd-risco",
        "lgpd-titulares",
        "lgpd-bases",
        "gdpr-ropa",
        "gdpr-avancado",
        "planos"
      ]
    }
  },
  business: {
    id: "business",
    nome: "RADAR GRC BUSINESS",
    preco: 149,
    descricao: "Frameworks, IA e documentos para auditoria.",
    recursos: [
      "Tudo do Standard",
      "ISO 27001-27002-27701 + SOC 2 + PCI-DSS",
      "Assistente de IA ilimitado",
      "Pacotes de políticas (PDF/MD)",
      "Até 10 usuários"
    ],
    limites: {
      usuarios: 10,
      exportacoes: true,
      relatorios: true,
      frameworks: ["iso27001", "iso27002", "iso27701", "soc2", "pcidss"],
      funcionalidades: [
        "dashboard",
        "assistente",
        "lgpd-registro",
        "lgpd-risco",
        "lgpd-titulares",
        "lgpd-bases",
        "gdpr-ropa",
        "gdpr-avancado",
        "iso",
        "ai-gov",
        "gap-analysis",
        "relatorios",
        "planos"
      ]
    }
  },
  completo: {
    id: "completo",
    nome: "RADAR GRC COMPLETO",
    preco: 249,
    descricao: "Tudo, sem limite, para toda a organização.",
    recursos: [
      "Tudo do Business",
      "Usuários ilimitados",
      "Exportações e relatórios completos",
      "Todos os frameworks ISO",
      "Suporte prioritário"
    ],
    limites: {
      usuarios: -1, // ilimitado
      exportacoes: true,
      relatorios: true,
      frameworks: ["iso27001", "iso27002", "iso27017", "iso27701", "iso22301", "iso31000", "iso37001", "iso37301", "soc2", "pcidss"],
      funcionalidades: [
        "dashboard",
        "assistente",
        "lgpd-registro",
        "lgpd-risco",
        "lgpd-titulares",
        "lgpd-bases",
        "gdpr-ropa",
        "gdpr-avancado",
        "iso",
        "ai-gov",
        "cookies",
        "gap-analysis",
        "siem",
        "pentest-lab",
        "privacy-by-design",
        "auditoria-ti",
        "comite",
        "status-report",
        "relatorios",
        "seguranca",
        "planos",
        "admin"
      ]
    }
  }
};

export function verificarPermissao(plano: PlanoId | "trial" | "demo", funcionalidade: string): boolean {
  if (plano === "demo" || plano === "completo") return true;
  if (plano === "trial") return false;
  
  const config = PLANOS[plano];
  return config.limites.funcionalidades.includes(funcionalidade);
}

export function verificarFramework(plano: PlanoId | "trial" | "demo", frameworkId: string): boolean {
  if (plano === "demo" || plano === "completo") return true;
  if (plano === "trial") return false;
  
  const config = PLANOS[plano];
  return config.limites.frameworks.includes(frameworkId);
}

export function verificarLimiteUsuarios(plano: PlanoId | "trial" | "demo", totalUsuarios: number): boolean {
  if (plano === "demo" || plano === "completo") return true;
  if (plano === "trial") return totalUsuarios <= 1;
  
  const config = PLANOS[plano];
  return totalUsuarios <= config.limites.usuarios;
}
