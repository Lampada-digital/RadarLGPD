# Guia de Deploy - Radar GRC White Label no Vercel

## ✅ Pré-requisitos

- Conta no GitHub
- Conta no Vercel
- Git instalado localmente

## 📋 Passo 1: Preparar o Repositório no GitHub

### 1.1 Criar repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique em **New repository**
3. Nome: `radar-grc` (ou outro nome de sua preferência)
4. Marque como **Private** (recomendado) ou **Public**
5. Clique em **Create repository**

### 1.2 Inicializar repositório localmente

Abra o terminal na pasta do projeto e execute:

```bash
# Inicializar git
git init

# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "Initial commit - Radar GRC White Label"

# Adicionar remote
git remote add origin https://github.com/SEU-USUARIO/radar-grc.git

# Fazer push
git branch -M main
git push -u origin main
```

## 🚀 Passo 2: Deploy no Vercel

### 2.1 Importar projeto no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **Add New... → Project**
3. Selecione o repositório `radar-grc` do GitHub
4. Clique em **Import**

### 2.2 Configurar projeto

O Vercel detectará automaticamente as configurações:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.3 Deploy

1. Clique em **Deploy**
2. Aguarde o deploy ser concluído (2-3 minutos)
3. Acesse a URL gerada (ex: `https://radar-grc.vercel.app`)

## 🔧 Passo 3: Configurar Domínio Personalizado (Opcional)

### 3.1 Adicionar domínio no Vercel

1. No painel do Vercel, vá em **Settings → Domains**
2. Clique em **Add**
3. Digite seu domínio (ex: `grc.suaempresa.com.br`)
4. Clique em **Add**

### 3.2 Configurar DNS

Adicione um registro CNAME no seu provedor de DNS:

```
Tipo: CNAME
Nome: grc (ou subdomínio desejado)
Valor: cname.vercel-dns.com
```

Aguarde a propagação do DNS (pode levar até 24 horas).

## 🎨 Passo 4: Configurar White Label

Após o deploy, acesse o sistema e:

1. Faça login com as credenciais root:
   - **Email**: `root@radargrc.app`
   - **Senha**: `Root#Radar2026`

2. Vá em **Administração → White Label**

3. Configure:
   - **Nome da Plataforma**: Nome que aparecerá no sistema
   - **Nome da Empresa**: Nome da empresa do cliente
   - **Logo**: Upload do logo da empresa
   - **Cores**: Personalize as cores do sistema
   - **Informações de contato**: Email e telefone de suporte
   - **Rodapé**: Texto personalizado do rodapé

4. Clique em **Salvar Configurações**

5. Escolha o nível de white label:
   - **Básico**: Marca "Powered by Radar GRC" visível
   - **Profissional**: Marca Radar GRC oculta
   - **Enterprise**: White label completo

## 🔐 Credenciais de Acesso

### Conta Root (Administrador Master)
- **Email**: `root@radargrc.app`
- **Senha**: `Root#Radar2026`

### Conta Demo
- **Email**: `demo@radarlgpd.app`
- **Senha**: `demo1234`

## 📝 Notas Importantes

### Armazenamento de Configurações

As configurações de white label são armazenadas no `localStorage` do navegador. Para um sistema multi-tenant completo, você precisará:

1. Implementar um backend (Node.js, Python, etc.)
2. Criar banco de dados para armazenar configurações por tenant
3. Implementar autenticação multi-tenant
4. Criar sistema de detecção de domínio/subdomínio

### Próximos Passos para Multi-Tenant Completo

Para transformar em um SaaS multi-tenant real:

1. **Backend API**: Criar API REST ou GraphQL
2. **Banco de Dados**: PostgreSQL, MySQL ou MongoDB
3. **Autenticação**: JWT com tenant ID
4. **Detecção de Domínio**: Middleware para identificar tenant pelo domínio
5. **Upload de Arquivos**: Sistema de upload para logos (S3, Cloudinary, etc.)
6. **Variáveis de Ambiente**: Configurar no Vercel

### Exemplo de Estrutura Backend

```
backend/
├── src/
│   ├── controllers/
│   │   └── tenantController.ts
│   ├── models/
│   │   └── Tenant.ts
│   ├── middleware/
│   │   └── tenantMiddleware.ts
│   └── routes/
│       └── tenantRoutes.ts
├── database/
│   └── schema.sql
└── package.json
```

## 🌐 URLs Úteis

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentação Vercel**: https://vercel.com/docs
- **GitHub Repository**: https://github.com/SEU-USUARIO/radar-grc

## 📞 Suporte

Se precisar de ajuda:
- Documentação do Vercel: https://vercel.com/docs
- Suporte Vercel: https://vercel.com/support

## ✅ Checklist de Deploy

- [ ] Repositório criado no GitHub
- [ ] Código enviado para o GitHub
- [ ] Projeto importado no Vercel
- [ ] Deploy concluído com sucesso
- [ ] Domínio personalizado configurado (opcional)
- [ ] DNS configurado (se aplicável)
- [ ] White Label configurado
- [ ] Testes realizados

---

**Pronto!** Seu Radar GRC White Label está no ar e pronto para ser personalizado para seus clientes.
