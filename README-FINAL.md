# 🚀 Radar GRC - Sistema Completo White Label

## 📋 Visão Geral

Sistema completo de Governança, Risco e Compliance (GRC) com suporte a White Label completo, permitindo que cada cliente tenha sua própria identidade visual em todo o sistema.

## ✨ Funcionalidades Principais

### 🎯 Módulos de Compliance
- **LGPD**: Registro art. 37, matriz de risco, gestão de titulares
- **GDPR**: ROPA Art. 30, DPIA, transferências internacionais
- **ISO 27001**: Sistema de Gestão de Segurança da Informação
- **ISO 27701**: Sistema de Gestão de Privacidade
- **ISO 22301**: Continuidade de Negócios
- **ISO 37301**: Gestão de Compliance
- **ISO 37001**: Gestão Antissuborno
- **ISO 42001**: Governança de IA
- **SOC 2**: Trust Services Criteria
- **PCI-DSS**: Segurança de Dados de Cartão

### 🎨 White Label Completo
- **Personalização Total**: Logo, cores, textos em todo o sistema
- **Componentes Branded**: Header, sidebar, botões, cards, tabelas
- **CSS Dinâmico**: Variáveis CSS atualizadas em tempo real
- **Persistência**: Configurações salvas no localStorage
- **Múltiplos Níveis**: Básico, Profissional, Enterprise

### 🛡️ Segurança
- Autenticação multi-tenant
- Proteção contra força bruta
- Trilha de auditoria completa
- Isolamento de dados por tenant

### 📊 Relatórios
- Exportação em PDF, Excel, CSV, JSON, PPT
- Relatórios personalizados com branding
- Gráficos e dashboards interativos

### 🤖 IA Integrada
- Classificação automática de dados
- Análise de conformidade
- Sugestões de melhorias
- Detecção de riscos

## 🚀 Deploy Rápido

### 1. GitHub

```bash
# Inicializar git
git init

# Adicionar arquivos
git add .

# Commit
git commit -m "Initial commit - Radar GRC White Label"

# Adicionar remote (substitua SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/radar-grc.git

# Push
git branch -M main
git push -u origin main
```

### 2. Vercel

1. Acesse: https://vercel.com/new
2. Importe o repositório `radar-grc`
3. Clique em **Deploy**
4. Aguarde 2-3 minutos
5. Acesse a URL gerada

### 3. Configurar White Label

1. Faça login com:
   - **Email**: `root@radargrc.app`
   - **Senha**: `Root#Radar2026`

2. Vá em **Administração → White Label**

3. Configure:
   - Nome da Plataforma
   - Nome da Empresa
   - Upload do Logo
   - Cores personalizadas
   - Informações de contato
   - Texto do rodapé

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

## 🎨 White Label - O que é Personalizável

### Elementos Visuais
- ✅ Logo da empresa (header e sidebar)
- ✅ Cor primária (header, sidebar, botões)
- ✅ Cor secundária (botões secundários)
- ✅ Cor de fundo
- ✅ Cor do texto
- ✅ Nome da plataforma
- ✅ Nome da empresa
- ✅ Texto do rodapé
- ✅ Título da página
- ✅ Favicon

### Componentes Afetados
- ✅ Header (cabeçalho)
- ✅ Sidebar (menu lateral)
- ✅ Botões primários e secundários
- ✅ Cards e containers
- ✅ Links
- ✅ Inputs e formulários
- ✅ Tabelas
- ✅ Badges e tags
- ✅ Progress bars
- ✅ Footer (rodapé)
- ✅ Checkboxes e radios
- ✅ Modais
- ✅ Tooltips
- ✅ Dropdowns

## 📚 Documentação

- **GUIA-DEPLOY.md**: Guia completo de deploy
- **WHITE-LABEL-GUIDE.md**: Guia completo de white label
- **DEPLOY_VERCEL.md**: Deploy específico para Vercel
- **ARQUITETURA_SAAS.md**: Arquitetura do sistema

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Estilização**: Tailwind CSS + CSS Dinâmico
- **Estado**: Context API + localStorage
- **Build**: Vite
- **Deploy**: Vercel

## 📦 Estrutura do Projeto

```
radar-grc/
├── src/
│   ├── components/
│   │   ├── BrandedComponents.tsx  # Componentes white label
│   │   ├── WhiteLabelAdmin.tsx    # Admin de white label
│   │   ├── Dashboard.tsx          # Dashboard principal
│   │   └── ...                    # Outros componentes
│   ├── lib/
│   │   ├── branding.tsx           # Contexto de branding
│   │   ├── tenant.ts              # Sistema multi-tenant
│   │   └── ...
│   ├── styles/
│   │   └── branding.css           # CSS dinâmico
│   ├── App.tsx                    # App principal
│   └── main.tsx                   # Entry point
├── public/
│   └── favicon.svg
├── GUIA-DEPLOY.md
├── WHITE-LABEL-GUIDE.md
├── DEPLOY_VERCEL.md
└── package.json
```

## 🎯 Casos de Uso

### 1. Consultoria de Compliance
- Personalize o sistema com sua marca
- Ofereça aos seus clientes
- Gerencie múltiplos clientes

### 2. Empresa de Tecnologia
- Use como produto interno
- Personalize com sua identidade
- Integre com seus sistemas

### 3. SaaS Multi-Tenant
- Cada cliente tem seu próprio sistema
- Identidade visual personalizada
- Isolamento completo de dados

## 💡 Dicas de Uso

1. **Teste as cores**: Use cores que contrastem bem
2. **Logo**: Use imagens com fundo transparente (PNG)
3. **Textos**: Mantenha textos curtos e claros
4. **Responsividade**: Teste em diferentes tamanhos de tela
5. **Acessibilidade**: Garanta contraste adequado

## 🔧 Personalização Avançada

### Adicionar Novos Componentes Branded

```tsx
import { useBranding } from '../lib/branding';

export function MeuComponenteBranded() {
  const { branding } = useBranding();
  
  return (
    <div style={{ 
      backgroundColor: branding.corPrimaria,
      color: 'white'
    }}>
      <h1>{branding.nomePlataforma}</h1>
    </div>
  );
}
```

### Usar Variáveis CSS

```css
.meu-elemento {
  background-color: var(--brand-primary);
  color: var(--brand-text);
}
```

## 📊 Métricas e Relatórios

- Exportação em múltiplos formatos (PDF, Excel, CSV, JSON, PPT)
- Relatórios personalizados com branding
- Gráficos interativos
- Dashboards em tempo real

## 🔒 Segurança

- Autenticação segura
- Proteção contra força bruta
- Trilha de auditoria completa
- Isolamento de dados por tenant
- Proteção contra XSS e CSRF

## 🌐 Domínio Personalizado

Para usar seu próprio domínio:

1. No Vercel: **Settings → Domains → Add**
2. Digite seu domínio (ex: `grc.suaempresa.com.br`)
3. No seu DNS, adicione:
   ```
   Tipo: CNAME
   Nome: grc (ou subdomínio)
   Valor: cname.vercel-dns.com
   ```
4. Aguarde propagação (até 24h)

## 📞 Suporte

- **Documentação**: Veja os arquivos .md na raiz
- **Vercel Docs**: https://vercel.com/docs
- **GitHub Docs**: https://docs.github.com

## ✅ Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Código enviado com `git push`
- [ ] Projeto importado no Vercel
- [ ] Deploy concluído com sucesso
- [ ] Sistema acessível pela URL
- [ ] Login funcionando
- [ ] White Label configurado
- [ ] Logo upload funcionando
- [ ] Cores personalizadas aplicadas
- [ ] Domínio personalizado configurado (opcional)

## 🎉 Pronto!

Seu Radar GRC White Label está pronto para uso!

Cada cliente pode ter sua própria identidade visual em todo o sistema, criando uma experiência personalizada e profissional.

---

**Desenvolvido com ❤️ para consultorias de compliance e empresas de tecnologia**
