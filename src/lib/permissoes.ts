// Sistema de Permissões Multi-Tenant
// Controle granular de acesso por perfil e módulo

export interface Permissao {
  modulo: string;
  acoes: string[];
}

export interface PerfilUsuario {
  id: string;
  nome: string;
  descricao: string;
  permissoes: Permissao[];
}

// Perfis padrão do sistema
export const PERFIS_PADRAO: Record<string, PerfilUsuario> = {
  admin: {
    id: 'admin',
    nome: 'Administrador da Empresa',
    descricao: 'Acesso total a todos os módulos e configurações',
    permissoes: [
      { modulo: 'todos', acoes: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'auditar'] },
    ],
  },
  dpo: {
    id: 'dpo',
    nome: 'DPO / Responsável por Privacidade',
    descricao: 'Gestão completa de privacidade e conformidade',
    permissoes: [
      { modulo: 'lgpd', acoes: ['visualizar', 'criar', 'editar', 'excluir', 'aprovar'] },
      { modulo: 'documentos', acoes: ['visualizar', 'criar', 'editar', 'excluir'] },
      { modulo: 'riscos', acoes: ['visualizar', 'criar', 'editar'] },
      { modulo: 'relatorios', acoes: ['visualizar', 'gerar'] },
    ],
  },
  auditor: {
    id: 'auditor',
    nome: 'Auditor',
    descricao: 'Acesso de leitura e auditoria',
    permissoes: [
      { modulo: 'todos', acoes: ['visualizar', 'auditar'] },
    ],
  },
  compliance: {
    id: 'compliance',
    nome: 'Compliance / GRC',
    descricao: 'Gestão de riscos e compliance',
    permissoes: [
      { modulo: 'riscos', acoes: ['visualizar', 'criar', 'editar'] },
      { modulo: 'compliance', acoes: ['visualizar', 'criar', 'editar'] },
      { modulo: 'planos-acao', acoes: ['visualizar', 'criar', 'editar'] },
      { modulo: 'documentos', acoes: ['visualizar', 'criar', 'editar'] },
    ],
  },
  usuario: {
    id: 'usuario',
    nome: 'Usuário',
    descricao: 'Acesso básico aos módulos contratados',
    permissoes: [
      { modulo: 'lgpd', acoes: ['visualizar'] },
      { modulo: 'documentos', acoes: ['visualizar'] },
    ],
  },
};

// Verificar se usuário tem permissão
export function verificarPermissao(
  perfil: string,
  modulo: string,
  acao: string
): boolean {
  const perfilData = PERFIS_PADRAO[perfil];
  if (!perfilData) return false;

  // Admin tem acesso total
  if (perfil === 'admin') return true;

  // Verificar permissões específicas
  const permissoesModulo = perfilData.permissoes.find(
    p => p.modulo === modulo || p.modulo === 'todos'
  );

  if (!permissoesModulo) return false;

  return permissoesModulo.acoes.includes(acao) || 
         permissoesModulo.acoes.includes('*');
}

// Obter ações permitidas para um perfil em um módulo
export function getAcoesPermitidas(perfil: string, modulo: string): string[] {
  const perfilData = PERFIS_PADRAO[perfil];
  if (!perfilData) return [];

  if (perfil === 'admin') {
    return ['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'auditar'];
  }

  const permissoesModulo = perfilData.permissoes.find(
    p => p.modulo === modulo || p.modulo === 'todos'
  );

  return permissoesModulo?.acoes || [];
}

// Middleware para proteger rotas
export function protegerRota(
  perfil: string,
  modulo: string,
  acao: string
): boolean {
  return verificarPermissao(perfil, modulo, acao);
}

// Criar perfil personalizado
export function criarPerfilPersonalizado(
  id: string,
  nome: string,
  descricao: string,
  permissoes: Permissao[]
): PerfilUsuario {
  return {
    id,
    nome,
    descricao,
    permissoes,
  };
}

// Módulos disponíveis
export const MODULOS_DISPONIVEIS = [
  'lgpd',
  'riscos',
  'compliance',
  'documentos',
  'auditoria',
  'planos-acao',
  'indicadores',
  'iso',
];

// Ações disponíveis
export const ACOES_DISPONIVEIS = [
  'visualizar',
  'criar',
  'editar',
  'excluir',
  'aprovar',
  'auditar',
  'gerar',
];
