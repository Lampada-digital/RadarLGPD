// Sistema de Pagamentos - Integração com Mercado Pago
// Este é um mock para demonstração. Em produção, integrar com backend real.

export interface PlanoPagamento {
  id: string;
  nome: string;
  preco: number;
  intervalo: 'mensal' | 'anual';
}

export interface Pagamento {
  id: string;
  tenantId: string;
  planoId: string;
  valor: number;
  status: 'pendente' | 'aprovado' | 'recusado' | 'cancelado';
  dataCriacao: string;
  dataAprovacao?: string;
  metodoPagamento: 'cartao' | 'pix' | 'boleto';
  externalReference?: string;
}

export interface WebhookMercadoPago {
  action: string;
  data: {
    id: string;
    status: string;
    external_reference?: string;
  };
}

// Mock de integração com Mercado Pago
export class MercadoPagoService {
  private static pagamentos: Map<string, Pagamento> = new Map();

  // Criar preferência de pagamento
  static async criarPreferencia(tenantId: string, plano: PlanoPagamento): Promise<{ init_point: string; id: string }> {
    // Em produção, chamar API do Mercado Pago
    // POST https://api.mercadopago.com/checkout/preferences
    
    const pagamentoId = 'MP_' + Math.random().toString(36).substr(2, 9);
    
    const pagamento: Pagamento = {
      id: pagamentoId,
      tenantId,
      planoId: plano.id,
      valor: plano.preco,
      status: 'pendente',
      dataCriacao: new Date().toISOString(),
      metodoPagamento: 'cartao',
      externalReference: tenantId,
    };
    
    this.pagamentos.set(pagamentoId, pagamento);
    
    // Mock de URL de pagamento
    return {
      init_point: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${pagamentoId}`,
      id: pagamentoId,
    };
  }

  // Processar webhook do Mercado Pago
  static async processarWebhook(webhook: WebhookMercadoPago): Promise<void> {
    const pagamento = this.pagamentos.get(webhook.data.id);
    if (!pagamento) return;

    if (webhook.data.status === 'approved') {
      pagamento.status = 'aprovado';
      pagamento.dataAprovacao = new Date().toISOString();
      
      // Em produção, aqui ativaria o tenant automaticamente
      console.log(`Pagamento aprovado para tenant ${pagamento.tenantId}`);
    } else if (webhook.data.status === 'rejected') {
      pagamento.status = 'recusado';
    }
    
    this.pagamentos.set(pagamento.id, pagamento);
  }

  // Verificar status do pagamento
  static async verificarPagamento(pagamentoId: string): Promise<Pagamento | null> {
    return this.pagamentos.get(pagamentoId) || null;
  }

  // Listar pagamentos de um tenant
  static async listarPagamentos(tenantId: string): Promise<Pagamento[]> {
    return Array.from(this.pagamentos.values()).filter(p => p.tenantId === tenantId);
  }

  // Simular aprovação de pagamento (para testes)
  static async simularAprovacao(pagamentoId: string): Promise<void> {
    const pagamento = this.pagamentos.get(pagamentoId);
    if (pagamento) {
      pagamento.status = 'aprovado';
      pagamento.dataAprovacao = new Date().toISOString();
      this.pagamentos.set(pagamentoId, pagamento);
    }
  }
}

// Tipos de webhook do Mercado Pago
export const WEBHOOK_ACTIONS = {
  PAYMENT_CREATED: 'payment.created',
  PAYMENT_UPDATED: 'payment.updated',
};

// Configurações do Mercado Pago (em produção, usar variáveis de ambiente)
// Em ambiente frontend, essas configurações viriam do backend
export const MERCADO_PAGO_CONFIG = {
  ACCESS_TOKEN: '', // Configurado no backend
  PUBLIC_KEY: '', // Configurado no backend
  WEBHOOK_URL: '', // Configurado no backend
};

// Função para criar assinatura recorrente
export async function criarAssinatura(tenantId: string, plano: PlanoPagamento): Promise<string> {
  // Em produção, chamar API de assinaturas do Mercado Pago
  // POST https://api.mercadopago.com/preapproval
  
  const assinaturaId = 'SUB_' + Math.random().toString(36).substr(2, 9);
  console.log(`Assinatura criada: ${assinaturaId} para tenant ${tenantId}`);
  
  return assinaturaId;
}

// Função para cancelar assinatura
export async function cancelarAssinatura(assinaturaId: string): Promise<void> {
  // Em produção, chamar API do Mercado Pago
  console.log(`Assinatura cancelada: ${assinaturaId}`);
}

// Função para fazer upgrade de plano
export async function fazerUpgrade(tenantId: string, novoPlano: PlanoPagamento): Promise<void> {
  // Em produção, calcular pro-rata e criar nova assinatura
  console.log(`Upgrade realizado para tenant ${tenantId} para plano ${novoPlano.id}`);
}

// Função para fazer downgrade de plano
export async function fazerDowngrade(tenantId: string, novoPlano: PlanoPagamento): Promise<void> {
  // Em produção, aplicar regras de downgrade
  console.log(`Downgrade realizado para tenant ${tenantId} para plano ${novoPlano.id}`);
}
