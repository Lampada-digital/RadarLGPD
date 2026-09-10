// Sistema de Multi-Tenancy
// Cada empresa (tenant) possui um ID exclusivo e ambiente isolado

export interface Tenant {
  id: string;
  nome: string;
  dominio: string;
  plano: 'starter' | 'professional' | 'enterprise';
  status: 'ativo' | 'suspenso' | 'cancelado';
  dataCriacao: string;
  dataRenovacao: string;
  logoUrl?: string;
  corPrimaria?: string;
  corSecundaria?: string;
  nomePlataforma?: string;
  dpoNome?: string;
  dpoEmail?: string;
  suporteEmail?: string;
  telefone?: string;
  endereco?: string;
  usuarios: string[];
  modulos: string[];
  limiteUsuarios: number;
  armazenamentoMB: number;
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
}

// Funções de gerenciamento de tenant
export class TenantManager {
  private static tenants: Map<string, Tenant> = new Map();

  static criarTenant(dados: Omit<Tenant, 'id' | 'dataCriacao' | 'dataRenovacao'>): Tenant {
    const id = this.gerarId();
    const tenant: Tenant = {
      ...dados,
      id,
      dataCriacao: new Date().toISOString(),
      dataRenovacao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
    };
    this.tenants.set(id, tenant);
    return tenant;
  }

  static obterTenant(id: string): Tenant | undefined {
    return this.tenants.get(id);
  }

  static obterTenantPorDominio(dominio: string): Tenant | undefined {
    return Array.from(this.tenants.values()).find(t => t.dominio === dominio);
  }

  static atualizarTenant(id: string, dados: Partial<Tenant>): Tenant | undefined {
    const tenant = this.tenants.get(id);
    if (!tenant) return undefined;
    
    const atualizado = { ...tenant, ...dados };
    this.tenants.set(id, atualizado);
    return atualizado;
  }

  static suspenderTenant(id: string): boolean {
    const tenant = this.tenants.get(id);
    if (!tenant) return false;
    
    tenant.status = 'suspenso';
    this.tenants.set(id, tenant);
    return true;
  }

  static reativarTenant(id: string): boolean {
    const tenant = this.tenants.get(id);
    if (!tenant) return false;
    
    tenant.status = 'ativo';
    this.tenants.set(id, tenant);
    return true;
  }

  static cancelarTenant(id: string): boolean {
    const tenant = this.tenants.get(id);
    if (!tenant) return false;
    
    tenant.status = 'cancelado';
    this.tenants.set(id, tenant);
    return true;
  }

  static listarTenants(): Tenant[] {
    return Array.from(this.tenants.values());
  }

  static verificarLimiteUsuarios(tenantId: string): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;
    return tenant.usuarios.length < tenant.limiteUsuarios;
  }

  private static gerarId(): string {
    return 'tenant_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }
}

// Planos comerciais
export const PLANOS = {
  starter: {
    nome: 'Starter',
    preco: 99,
    limiteUsuarios: 5,
    armazenamentoMB: 1000,
    modulos: ['lgpd'],
    whiteLabel: false,
    dominioProprio: false,
    relatoriosPersonalizados: false,
    suporte: 'email',
  },
  professional: {
    nome: 'Professional',
    preco: 299,
    limiteUsuarios: 20,
    armazenamentoMB: 5000,
    modulos: ['lgpd', 'riscos', 'compliance', 'documentos'],
    whiteLabel: true,
    dominioProprio: false,
    relatoriosPersonalizados: true,
    suporte: 'email+chat',
  },
  enterprise: {
    nome: 'Enterprise',
    preco: 799,
    limiteUsuarios: -1, // ilimitado
    armazenamentoMB: 50000,
    modulos: ['lgpd', 'riscos', 'compliance', 'documentos', 'auditoria', 'planos-acao', 'indicadores'],
    whiteLabel: true,
    dominioProprio: true,
    relatoriosPersonalizados: true,
    suporte: 'prioritario',
  },
};

// Middleware para identificar tenant
export function identificarTenant(dominio: string): Tenant | undefined {
  return TenantManager.obterTenantPorDominio(dominio);
}

// Middleware para verificar permissões
export function verificarPermissao(tenantId: string, modulo: string): boolean {
  const tenant = TenantManager.obterTenant(tenantId);
  if (!tenant) return false;
  return tenant.modulos.includes(modulo);
}

// Middleware para verificar limites
export function verificarLimite(tenantId: string, tipo: 'usuarios' | 'armazenamento'): boolean {
  const tenant = TenantManager.obterTenant(tenantId);
  if (!tenant) return false;
  
  if (tipo === 'usuarios') {
    return tenant.usuarios.length < tenant.limiteUsuarios || tenant.limiteUsuarios === -1;
  }
  
  // Verificar armazenamento (implementação futura)
  return true;
}
