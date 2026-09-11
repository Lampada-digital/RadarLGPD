# 🚀 GUIA COMPLETO: Como Publicar no GitHub (Passo a Passo)

## 📋 Antes de Começar

Você precisa de:
- ✅ Conta no GitHub (https://github.com)
- ✅ Projeto Radar GRC baixado no seu computador
- ✅ Git instalado (https://git-scm.com/downloads)

---

## 🔧 PASSO 1: Criar Repositório no GitHub

### 1.1 Acessar o GitHub
1. Abra o navegador
2. Acesse: **https://github.com**
3. Faça login na sua conta

### 1.2 Criar Novo Repositório
1. Clique no botão **"+"** no canto superior direito
2. Selecione **"New repository"** (Novo repositório)

### 1.3 Preencher Informações
- **Repository name**: `radar-grc` (ou o nome que quiser)
- **Description**: `Sistema GRC White Label - LGPD, GDPR, ISO`
- **Public**: ✅ Marque esta opção
- **Add a README**: ❌ **NÃO MARQUE** (já existe)
- **Add .gitignore**: ❌ Deixe em "None"
- **Choose a license**: ❌ Deixe em "None"

### 1.4 Criar Repositório
- Clique no botão verde **"Create repository"**
- **IMPORTANTE**: Copie a URL que aparece (ex: `https://github.com/seu-usuario/radar-grc.git`)

---

## 💻 PASSO 2: Configurar Git no Seu Computador

### 2.1 Abrir Terminal
- **Windows**: Abra o "Git Bash" ou "PowerShell"
- **Mac/Linux**: Abra o "Terminal"

### 2.2 Navegar até a Pasta do Projeto
```bash
cd caminho/para/pasta/radar-grc
```

Exemplo:
```bash
cd Downloads/radar-grc
```

### 2.3 Configurar Git (Primeira Vez)
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

---

## 📦 PASSO 3: Inicializar e Enviar Código

### 3.1 Inicializar Git
```bash
git init
```

### 3.2 Adicionar Todos os Arquivos
```bash
git add .
```

### 3.3 Fazer Primeiro Commit
```bash
git commit -m "Initial commit - Radar GRC"
```

### 3.4 Renomear Branch para Main
```bash
git branch -M main
```

### 3.5 Adicionar Remote (URL do GitHub)
```bash
git remote add origin https://github.com/SEU-USUARIO/radar-grc.git
```

**IMPORTANTE**: Substitua `SEU-USUARIO` pelo seu usuário do GitHub!

Exemplo:
```bash
git remote add origin https://github.com/joaosilva/radar-grc.git
```

### 3.6 Fazer Push para o GitHub
```bash
git push -u origin main
```

---

## 🔐 PASSO 4: Autenticação

Quando o Git pedir autenticação:

### Opção 1: Personal Access Token (Recomendado)

1. Acesse: **https://github.com/settings/tokens**
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Preencha:
   - **Note**: `Radar GRC Deploy`
   - **Expiration**: `90 days` (ou o que preferir)
   - **Select scopes**: ✅ Marque **repo** (todos os itens)
4. Clique em **"Generate token"**
5. **COPIE O TOKEN** (começa com `ghp_`)
6. Quando o Git pedir senha, **COLE O TOKEN** (não a senha do GitHub)

### Opção 2: GitHub CLI

1. Instale: https://cli.github.com/
2. Execute:
```bash
gh auth login
```
3. Siga as instruções

---

## 🚀 PASSO 5: Deploy na Vercel

### 5.1 Acessar Vercel
1. Acesse: **https://vercel.com**
2. Clique em **"Sign Up"** ou **"Log In"**
3. Faça login com sua conta GitHub

### 5.2 Importar Projeto
1. Clique em **"Add New..."** → **"Project"**
2. Clique em **"Import Git Repository"**
3. Selecione o repositório **radar-grc**
4. Clique em **"Import"**

### 5.3 Configurar Deploy
O Vercel detectará automaticamente:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 5.4 Fazer Deploy
- Clique em **"Deploy"**
- Aguarde 2-3 minutos
- Acesse a URL gerada (ex: `https://radar-grc.vercel.app`)

---

## ❌ Problemas Comuns e Soluções

### Problema 1: "fatal: not a git repository"
**Solução**: Execute `git init` na pasta do projeto

### Problema 2: "remote origin already exists"
**Solução**: Execute:
```bash
git remote remove origin
git remote add origin URL_DO_REPOSITORIO
```

### Problema 3: "Authentication failed"
**Solução**: Use um Personal Access Token (ver PASSO 4)

### Problema 4: "Updates were rejected"
**Solução**: Execute:
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Problema 5: "error: failed to push some refs"
**Solução**: Execute:
```bash
git push -f origin main
```

---

## ✅ Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Git configurado (nome e email)
- [ ] Código enviado com `git push`
- [ ] Projeto importado no Vercel
- [ ] Deploy concluído com sucesso
- [ ] Site acessível pela URL
- [ ] Login funcionando
- [ ] White Label configurado

---

## 📞 Precisa de Ajuda?

### Links Úteis:
- GitHub Docs: https://docs.github.com
- Vercel Docs: https://vercel.com/docs
- Git Download: https://git-scm.com/downloads

### Se ainda tiver problemas:
1. Me diga qual passo está dando erro
2. Copie a mensagem de erro exata
3. Eu te ajudo a resolver!

---

## 🎉 Pronto!

Seu Radar GRC está no ar e pronto para uso!

**Credenciais de acesso:**
- **Email**: `root@radargrc.app`
- **Senha**: `Root#Radar2026`

**Próximos passos:**
1. Configure o White Label
2. Crie usuários
3. Personalize o sistema
4. Comece a usar!

---

**Boa sorte! 🚀**
