# Arquitetura SaaS Multi-Tenant - Radar GRC

## Visão Geral

O Radar GRC foi transformado em uma plataforma SaaS multi-tenant, White Label, escalável e comercializável. A plataforma opera como uma única aplicação central, onde cada empresa contratante possui um ambiente independente e isolado.

## Arquitetura Multi-Tenant

### Conceito
- **Single Application**: Uma única aplicação serve todos os clientes
- **Tenant Isolation**: Cada empresa possui um Tenant ID exclusivo
- **Data Isolation**: Dados de cada tenant são completamente isolados
- **Shared Resources**: Infraestrutura compartilhada (servidores, banco de dados)

### Estrutura do Tenant

```typescript
interface Tenant {
  id: string;                    // Tenant ID exclusivo
  nome: string;                  // Nome da empresa
  dominio: string;               // Subdomínio (empresa.radar-lgpd.com.br)
  plano: 'starter' | 'professional' | 'enterprise';
  status: 'ativo' | 'suspenso' | 'cancelado' | 'trial';
  
  // Configurações White Label
  logoUrl?: string;
  corPrimaria: string;
  corSecundaria: string;
  nomePlataforma: string;
  
  // Informações institucionais
  dpoNome?: string;
  dpoEmail?: string;
  suporteEmail?: string;
  
  // Limites do plano
  usuarios: string[];
  modulos: string[];
  limiteUsuarios: number;
  armazenamentoMB: number;
}
```

## Planos Comerciais

### Starter (R$ 99/mês)
- Até 5 usuários
- 1GB de armazenamento
- Módulo LGPD completo
- Relatórios padrão
- Suporte por email

### Professional (R$ 299/mês)
- Até 20 usuários
- 5GB de armazenamento
- Módulos: LGPD, Riscos, Compliance, Documentos
- White Label básico
- Relatórios personalizados
- Suporte por email e chat

### Enterprise (R$ 799/mês)
- Usuários ilimitados
- 50GB de armazenamento
- Todos os módulos
- White Label completo
- Domínio próprio
- API de integração
- Suporte prioritário 24/7

## White Label

### Níveis de Personalização

#### Básico (Professional)
- Logo da empresa no header
- Cores personalizadas
- "Powered by Radar GRC" no footer

#### Profissional (Professional)
- Logo da empresa em todos os lugares
- Cores e tipografia personalizadas
- Sem referência ao Radar GRC na interface principal

#### Enterprise (Enterprise)
- Identidade visual completa da empresa
- Domínio próprio (privacidade.empresa.com.br)
- Login personalizado
- Relatórios totalmente personalizados
- Sem nenhuma referência ao Radar GRC

## Fluxo de Contratação

1. **Acesso à Página Comercial**
   - Visitante conhece a plataforma
   - Escolhe plano e módulos
   - Clica em "Começar"

2. **Cadastro da Empresa**
   - Preenche dados da empresa
   - Escolhe subdomínio ou domínio próprio
   - Cria conta do administrador inicial

3. **Pagamento (Mercado Pago)**
   - Escolhe método de pagamento
   - Efetua pagamento
   - Sistema recebe webhook de confirmação

4. **Ativação Automática**
   - Tenant ID gerado automaticamente
   - Ambiente criado e configurado
   - Módulos liberados conforme plano
   - Administrador inicial criado

5. **Primeiro Acesso**
   - Configuração de identidade visual
   - Upload de logo e favicon
   - Definição de cores e nome da plataforma
   - Cadastro de informações institucionais

## Integração com Mercado Pago

### Fluxo de Pagamento

```typescript
// 1. Criar preferência de pagamento
const preferencia = await MercadoPagoService.criarPreferencia(tenantId, plano);

// 2. Redirecionar para pagamento
window.location.href = preferencia.init_point;

// 3. Receber webhook de confirmação
app.post('/webhook/mercadopago', async (req, res) => {
  await MercadoPagoService.processarWebhook(req.body);
  
  if (req.body.data.status === 'approved') {
    // Ativar tenant automaticamente
    await ativarTenant(req.body.data.external_reference);
  }
});
```

### Webhooks
- `payment.created`: Pagamento criado
- `payment.updated`: Status do pagamento atualizado
- `payment.approved`: Pagamento aprovado (gatilho para ativação)

## Sistema de Permissões

### Perfis de Usuário

#### Administrador da Empresa
- Acesso total a todos os módulos
- Gerenciar usuários e permissões
- Configurar White Label
- Gerenciar plano e billing

#### DPO / Responsável por Privacidade
- Gestão completa de privacidade
- Criar e editar documentos
- Aprovar avaliações de risco
- Gerar relatórios

#### Auditor
- Acesso de leitura em todos os módulos
- Visualizar evidências
- Gerar relatórios de auditoria

#### Compliance / GRC
- Gestão de riscos
- Planos de ação
- Documentos de compliance

#### Usuário
- Acesso básico aos módulos contratados
- Visualizar documentos e riscos

### Controle de Acesso

```typescript
// Verificar permissão
if (verificarPermissao(usuario.perfil, 'lgpd', 'criar')) {
  // Permitir criação
}

// Middleware de proteção
app.get('/api/lgpd/avaliacoes', 
  protegerRota('lgpd', 'visualizar'),
  async (req, res) => {
    // Retornar apenas dados do tenant do usuário
    const avaliacoes = await getAvaliacoes(req.user.tenantId);
    res.json(avaliacoes);
  }
);
```

## Módulos Modulares

### Arquitetura Modular

```typescript
const MODULOS = {
  lgpd: {
    nome: 'LGPD & GDPR',
    rotas: ['/lgpd/*'],
    componentes: ['Avaliacao', 'MatrizRisco', 'Politicas'],
  },
  riscos: {
    nome: 'Gestão de Riscos',
    rotas: ['/riscos/*'],
    componentes: ['Risco', 'Tratamento', 'Monitoramento'],
  },
  compliance: {
    nome: 'Compliance',
    rotas: ['/compliance/*'],
    componentes: ['Controles', 'Evidencias', 'Auditoria'],
  },
  // ... outros módulos
};
```

### Ativação de Módulos

```typescript
// Verificar se módulo está habilitado para o tenant
if (tenant.modulos.includes('lgpd')) {
  // Mostrar módulo LGPD
}

// Impedir acesso a módulos não contratados
if (!tenant.modulos.includes('riscos')) {
  // Mostrar mensagem de upgrade
}
```

## Isolamento de Dados

### Estratégia de Isolamento

#### Opção 1: Shared Database, Tenant Column
```sql
SELECT * FROM avaliacoes WHERE tenant_id = 'tenant_123';
```

#### Opção 2: Schema per Tenant
```sql
-- Cada tenant tem seu próprio schema
SELECT * FROM tenant_123.avaliacoes;
```

#### Opção 3: Database per Tenant
```sql
-- Cada tenant tem seu próprio database
SELECT * FROM tenant_123_db.avaliacoes;
```

### Implementação Recomendada

Para escalabilidade e simplicidade, recomendamos **Shared Database, Tenant Column**:

```typescript
// Middleware para injetar tenantId em todas as queries
app.use((req, res, next) => {
  req.tenantId = req.user.tenantId;
  next();
});

// Repository pattern com filtro automático
class AvaliacaoRepository {
  async findAll(tenantId: string) {
    return db.avaliacoes.findMany({
      where: { tenantId }
    });
  }
}
```

## Segurança

### Autenticação
- JWT com tenantId no payload
- Refresh tokens para sessões longas
- MFA opcional para administradores

### Autorização
- Verificação de permissões em cada rota
- Validação de tenantId em todas as queries
- Rate limiting por tenant

### Proteção de Dados
- Criptografia em repouso (AES-256)
- Criptografia em trânsito (TLS 1.3)
- Backup automático diário
- Logs de auditoria completos

## Escalabilidade

### Horizontal Scaling
- Load balancer (NGINX/ALB)
- Múltiplas instâncias da aplicação
- Session storage centralizado (Redis)

### Database Scaling
- Read replicas para consultas
- Connection pooling
- Query optimization

### Caching
- Redis para cache de sessão
- CDN para assets estáticos
- Cache de queries frequentes

## Monitoramento

### Métricas
- Uso de CPU e memória por tenant
- Tempo de resposta por tenant
- Erros e exceptions
- Uso de armazenamento

### Logs
- Logs estruturados (JSON)
- Correlação por tenantId
- Retenção configurável

### Alertas
- Uso de recursos acima do limite
- Erros críticos
- Tentativas de acesso cross-tenant

## Próximos Passos para Produção

### Backend Necessário
1. **API REST** (Node.js/Express ou similar)
2. **Banco de Dados** (PostgreSQL/MySQL)
3. **Autenticação** (JWT + OAuth2)
4. **Integração Mercado Pago** (Webhooks)
5. **Armazenamento de Arquivos** (S3 ou similar)
6. **Email Service** (SendGrid/Mailgun)
7. **Monitoramento** (DataDog/New Relic)

### Infraestrutura
1. **Servidores** (AWS/GCP/Azure)
2. **Load Balancer**
3. **CDN** (CloudFront/Cloudflare)
4. **Database** (RDS/Cloud SQL)
5. **Cache** (ElastiCache/Memory Store)

### Deploy
1. **CI/CD** (GitHub Actions/GitLab CI)
2. **Containerização** (Docker)
3. **Orquestração** (Kubernetes/ECS)
4. **Blue-Green Deployment**

## Conclusão

A arquitetura atual do frontend está preparada para evoluir para um SaaS completo. As bases do multi-tenancy, sistema de planos, White Label e permissões estão implementadas. O próximo passo é desenvolver o backend e a infraestrutura necessária para suportar a operação em produção.

## Documentação Adicional

- [Guia de Integração Mercado Pago](./docs/mercadopago.md)
- [Guia de White Label](./docs/whitelabel.md)
- [Guia de Permissões](./docs/permissoes.md)
- [Guia de Deploy](./docs/deploy.md)
