# Guia de Transformação para SaaS Completo

## Status Atual

O frontend do Radar GRC possui as seguintes bases implementadas:

✅ **Estrutura Multi-Tenant**
- Definição de Tenant com todos os campos necessários
- Sistema de planos (Starter, Professional, Enterprise)
- Contexto de tenant (TenantProvider)
- Funções utilitárias de gerenciamento

✅ **Sistema de Planos**
- Definição completa dos 3 planos comerciais
- Limites de usuários, armazenamento e módulos
- Recursos e funcionalidades por plano

✅ **White Label**
- Níveis de personalização (básico, profissional, enterprise)
- Configurações de identidade visual
- Suporte a domínio próprio

✅ **Sistema de Permissões**
- Perfis de usuário (admin, dpo, auditor, compliance, usuario)
- Controle granular por módulo e ação
- Funções de verificação de permissão

✅ **Mock de Pagamentos**
- Integração simulada com Mercado Pago
- Fluxo de criação de preferência de pagamento
- Processamento de webhooks
- Gestão de assinaturas

✅ **Página Comercial**
- Landing page profissional
- Apresentação de recursos e módulos
- Comparação de planos
- Call-to-action para contratação

✅ **Documentação**
- Arquitetura completa documentada
- Guia de evolução para produção

## Próximos Passos para Produção

### 1. Desenvolvimento do Backend

#### Tecnologias Recomendadas
```
- Node.js + Express ou NestJS
- PostgreSQL (banco de dados principal)
- Redis (cache e sessões)
- JWT (autenticação)
- Prisma ou TypeORM (ORM)
```

#### Estrutura do Backend
```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/          # Autenticação e autorização
│   │   ├── tenant/        # Gestão de tenants
│   │   ├── user/          # Gestão de usuários
│   │   ├── payment/       # Integração Mercado Pago
│   │   ├── lgpd/          # Módulo LGPD
│   │   ├── riscos/        # Módulo de Riscos
│   │   ├── compliance/    # Módulo Compliance
│   │   └── ...            # Outros módulos
│   ├── shared/
│   │   ├── middleware/    # Middlewares (auth, tenant, etc)
│   │   ├── guards/        # Guards de permissão
│   │   └── utils/         # Utilitários
│   └── config/            # Configurações
├── prisma/
│   └── schema.prisma      # Schema do banco de dados
└── tests/                 # Testes
```

#### Schema do Banco de Dados (Prisma)
```prisma
model Tenant {
  id              String    @id @default(uuid())
  nome            String
  dominio         String    @unique
  plano           String
  status          String
  dataCriacao     DateTime  @default(now())
  dataRenovacao   DateTime
  
  // White Label
  logoUrl         String?
  corPrimaria     String
  corSecundaria   String
  nomePlataforma  String
  
  // Limites
  limiteUsuarios  Int
  armazenamentoMB Int
  
  // Relacionamentos
  usuarios        Usuario[]
  avaliacoes      Avaliacao[]
  riscos          Risco[]
  documentos      Documento[]
}

model Usuario {
  id              String    @id @default(uuid())
  tenantId        String
  tenant          Tenant    @relation(fields: [tenantId], references: [id])
  nome            String
  email           String
  perfil          String
  ativo           Boolean   @default(true)
  dataCriacao     DateTime  @default(now())
  
  @@unique([tenantId, email])
}

model Avaliacao {
  id              String    @id @default(uuid())
  tenantId        String
  tenant          Tenant    @relation(fields: [tenantId], references: [id])
  titulo          String
  status          String
  dataCriacao     DateTime  @default(now())
}

// ... outros modelos (Risco, Documento, PlanoAcao, etc)
```

### 2. Integração com Mercado Pago

#### Configuração
```typescript
// backend/src/config/mercadopago.ts
export const mercadoPagoConfig = {
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  publicKey: process.env.MERCADO_PAGO_PUBLIC_KEY,
};
```

#### Criação de Preferência
```typescript
// backend/src/modules/payment/payment.service.ts
async criarPreferencia(tenantId: string, plano: Plano) {
  const preference = {
    items: [
      {
        title: plano.nome,
        quantity: 1,
        unit_price: plano.preco,
      },
    ],
    external_reference: tenantId,
    back_urls: {
      success: `${FRONTEND_URL}/sucesso`,
      failure: `${FRONTEND_URL}/falha`,
      pending: `${FRONTEND_URL}/pendente`,
    },
    auto_return: 'approved',
  };
  
  return await mercadopago.preferences.create(preference);
}
```

#### Webhook de Confirmação
```typescript
// backend/src/modules/payment/payment.controller.ts
@Post('/webhook')
async handleWebhook(@Body() webhook: WebhookPayload) {
  if (webhook.type === 'payment') {
    const payment = await mercadopago.payment.findById(webhook.data.id);
    
    if (payment.status === 'approved') {
      const tenantId = payment.external_reference;
      
      // Ativar tenant
      await this.tenantService.ativarTenant(tenantId);
      
      // Enviar email de boas-vindas
      await this.emailService.enviarBoasVindas(tenantId);
    }
  }
  
  return { success: true };
}
```

### 3. Autenticação Multi-Tenant

#### JWT com Tenant ID
```typescript
// backend/src/modules/auth/auth.service.ts
async login(email: string, password: string) {
  const usuario = await this.usuarioService.findByEmail(email);
  
  if (!usuario || !await bcrypt.compare(password, usuario.senha)) {
    throw new UnauthorizedException('Credenciais inválidas');
  }
  
  const payload = {
    sub: usuario.id,
    tenantId: usuario.tenantId,
    perfil: usuario.perfil,
  };
  
  return {
    access_token: await this.jwtService.sign(payload),
  };
}
```

#### Middleware de Tenant
```typescript
// backend/src/shared/middleware/tenant.middleware.ts
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.user?.tenantId;
    
    if (!tenantId) {
      throw new UnauthorizedException('Tenant não identificado');
    }
    
    req['tenantId'] = tenantId;
    next();
  }
}
```

### 4. Isolamento de Dados

#### Repository Pattern com Filtro Automático
```typescript
// backend/src/modules/lgpd/avaliacao.repository.ts
@Injectable()
export class AvaliacaoRepository {
  constructor(
    @InjectRepository(Avaliacao)
    private readonly repository: Repository<Avaliacao>,
  ) {}
  
  async findAll(tenantId: string): Promise<Avaliacao[]> {
    return this.repository.find({
      where: { tenantId },
    });
  }
  
  async create(tenantId: string, data: CreateAvaliacaoDto): Promise<Avaliacao> {
    return this.repository.save({
      ...data,
      tenantId,
    });
  }
}
```

### 5. Infraestrutura

#### Docker Compose (Desenvolvimento)
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/radargrc
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=radargrc
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

#### Kubernetes (Produção)
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: radargrc-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: radargrc-backend
  template:
    metadata:
      labels:
        app: radargrc-backend
    spec:
      containers:
      - name: backend
        image: radargrc/backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: radargrc-secrets
              key: database-url
```

### 6. Deploy

#### CI/CD com GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Backend
      run: |
        cd backend
        npm ci
        npm run build
    
    - name: Build Frontend
      run: |
        cd frontend
        npm ci
        npm run build
    
    - name: Deploy to Production
      run: |
        # Deploy para Kubernetes, AWS, etc
        kubectl apply -f k8s/
```

### 7. Monitoramento

#### Logs Estruturados
```typescript
// backend/src/shared/logger/logger.service.ts
@Injectable()
export class LoggerService {
  log(message: string, context: any) {
    console.log(JSON.stringify({
      level: 'info',
      message,
      tenantId: context.tenantId,
      userId: context.userId,
      timestamp: new Date().toISOString(),
    }));
  }
}
```

#### Métricas
```typescript
// backend/src/modules/metrics/metrics.service.ts
@Injectable()
export class MetricsService {
  async getTenantMetrics(tenantId: string) {
    return {
      usuarios: await this.countUsuarios(tenantId),
      armazenamento: await this.getArmazenamentoUsado(tenantId),
      avaliacoes: await this.countAvaliacoes(tenantId),
    };
  }
}
```

## Checklist de Produção

### Backend
- [ ] API REST completa
- [ ] Autenticação JWT
- [ ] Multi-tenancy implementado
- [ ] Integração Mercado Pago
- [ ] Sistema de permissões
- [ ] Logs e monitoramento
- [ ] Testes unitários e de integração
- [ ] Documentação da API (Swagger)

### Frontend
- [ ] Integração com backend
- [ ] Autenticação multi-tenant
- [ ] White Label dinâmico
- [ ] Gestão de planos
- [ ] Upload de arquivos
- [ ] Testes E2E

### Infraestrutura
- [ ] Servidores configurados
- [ ] Banco de dados configurado
- [ ] CDN configurado
- [ ] SSL/TLS configurado
- [ ] Backups automáticos
- [ ] Monitoramento configurado
- [ ] Alertas configurados

### Segurança
- [ ] Criptografia em repouso
- [ ] Criptografia em trânsito
- [ ] Rate limiting
- [ ] WAF (Web Application Firewall)
- [ ] Backup e recuperação de desastres
- [ ] Política de retenção de dados

### Compliance
- [ ] LGPD compliance
- [ ] Termos de uso
- [ ] Política de privacidade
- [ ] SLA definido
- [ ] DPO nomeado

## Conclusão

O frontend está preparado para evoluir para um SaaS completo. As bases do multi-tenancy, sistema de planos, White Label e permissões estão implementadas. O próximo passo é desenvolver o backend e a infraestrutura necessária para suportar a operação em produção.

Com a arquitetura documentada e os próximos passos definidos, a transformação em uma plataforma SaaS profissional, comercializável e escalável está totalmente viável.
