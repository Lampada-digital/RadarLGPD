// Sistema de Multi-Tenancy
// Cada empresa (tenant) possui um ID exclusivo e ambiente isolado

export interface Tenant {
  id: string;
  nome: string;
  dominio: string;
  plano: 'starter' | 'professional' | 'enterprise';
  status: 'ativo' | 'suspenso' | 'cancelado' | 'trial';
  dataCriacao: string;
  dataRenovacao: string;
  logoUrl?: string;
  faviconUrl?: string;
  corPrimaria: string;
  corSecundaria: string;
  nomePlataforma: string;
  dpoNome?: string;
  dpoEmail?: string;
  suporteEmail?: string;
  telefone?: string;
  endereco?: string;
  usuarios: string[];
  modulos: string[];
  limiteUsuarios: number;
  armazenamentoMB: number;
  whiteLabelNivel: 'basico' | 'profissional' | 'enterprise';
  dominioProprio?: string;
}

export interface UsuarioTenant {
  id: string;
  tenantId: string;
  nome: string;
  email: string;
  perfil: 'admin' | 'dpo' | 'auditor' | 'compliance' | 'usuario';
  ativo: boolean;
  dataCriacao: string;
  ultimoAcesso?: string;
  permissoes: string[];
}

export interface PlanoComercial {
  id: 'starter' | 'professional' | 'enterprise';
  nome: string;
  preco: number;
  limiteUsuarios: number;
  armazenamentoMB: number;
  modulos: string[];
  whiteLabel: boolean;
  dominioProprio: boolean;
  relatoriosPersonalizados: boolean;
  suporte: 'email' | 'email+chat' | 'prioritario';
  descricao: string;
  recursos: string[];
}

export const PLANOS: Record<string, PlanoComercial> = {
  starter: {
    id: 'starter',
    nome: 'Starter',
    preco: 99,
    limiteUsuarios: 5,
    armazenamentoMB: 1000,
    modulos: ['lgpd'],
    whiteLabel: false,
    dominioProprio: false,
    relatoriosPersonalizados: false,
    suporte: 'email',
    descricao: 'Ideal para pequenas empresas iniciando na conformidade',
    recursos: [
      'Módulo LGPD completo',
      'Até 5 usuários',
      '1GB de armazenamento',
      'Relatórios padrão',
      'Suporte por email',
      'Diagnóstico de conformidade',
      'Gestão de riscos básica',
    ],
  },
  professional: {
    id: 'professional',
    nome: 'Professional',
    preco: 299,
    limiteUsuarios: 20,
    armazenamentoMB: 5000,
    modulos: ['lgpd', 'riscos', 'compliance', 'documentos'],
    whiteLabel: true,
    dominioProprio: false,
    relatoriosPersonalizados: true,
    suporte: 'email+chat',
    descricao: 'Para empresas em crescimento que precisam de mais recursos',
    recursos: [
      'Todos os módulos do Starter',
      'Até 20 usuários',
      '5GB de armazenamento',
      'White Label básico',
      'Relatórios personalizados',
      'Suporte por email e chat',
      'Gestão de riscos avançada',
      'Módulo de documentos',
      'Planos de ação',
    ],
  },
  enterprise: {
    id: 'enterprise',
    nome: 'Enterprise',
    preco: 799,
    limiteUsuarios: -1, // ilimitado
    armazenamentoMB: 50000,
    modulos: ['lgpd', 'riscos', 'compliance', 'documentos', 'auditoria', 'planos-acao', 'indicadores', 'iso'],
    whiteLabel: true,
    dominioProprio: true,
    relatoriosPersonalizados: true,
    suporte: 'prioritario',
    descricao: 'Solução completa para grandes organizações',
    recursos: [
      'Todos os módulos',
      'Usuários ilimitados',
      '50GB de armazenamento',
      'White Label completo',
      'Domínio próprio',
      'Relatórios totalmente personalizados',
      'Suporte prioritário 24/7',
      'API de integração',
      'Módulos ISO (27001, 27701, 37301, 37001)',
      'Auditoria completa',
      'Indicadores avançados',
    ],
  },
};

// Contexto do Tenant (será usado em toda a aplicação)
export interface TenantContext {
  tenant: Tenant | null;
  usuario: UsuarioTenant | null;
  setTenant: (tenant: Tenant) => void;
  setUsuario: (usuario: UsuarioTenant) => void;
  logout: () => void;
}

// Funções utilitárias
export function verificarPermissao(modulo: string, tenant: Tenant): boolean {
  return tenant.modulos.includes(modulo);
}

export function verificarLimiteUsuarios(tenant: Tenant): boolean {
  if (tenant.limiteUsuarios === -1) return true; // ilimitado
  return tenant.usuarios.length < tenant.limiteUsuarios;
}

export function calcularArmazenamentoUsado(tenantId: string): number {
  // Em produção, isso viria do backend
  const key = `storage_${tenantId}`;
  const usado = localStorage.getItem(key);
  return usado ? parseInt(usado) : 0;
}

export function registrarUsoArmazenamento(tenantId: string, bytes: number): void {
  const key = `storage_${tenantId}`;
  const atual = calcularArmazenamentoUsado(tenantId);
  localStorage.setItem(key, String(atual + bytes));
}

export function obterTenantPorDominio(dominio: string): Tenant | null {
  // Em produção, isso viria do backend
  const tenants = JSON.parse(localStorage.getItem('tenants') || '[]');
  return tenants.find((t: Tenant) => t.dominio === dominio || t.dominioProprio === dominio) || null;
}

export function salvarTenant(tenant: Tenant): void {
  const tenants = JSON.parse(localStorage.getItem('tenants') || '[]');
  const index = tenants.findIndex((t: Tenant) => t.id === tenant.id);
  if (index >= 0) {
    tenants[index] = tenant;
  } else {
    tenants.push(tenant);
  }
  localStorage.setItem('tenants', JSON.stringify(tenants));
}

export function gerarTenantId(): string {
  return 'tenant_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}
