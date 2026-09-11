# Solução: Limite de Deploy Vercel e Conflitos

## 🚨 Problema 1: Taxa de Implantação Limitada

Você tem **muitos projetos de preview** na Vercel (radar-lgpd-2kzz, radar-lgpd-3phw, etc.). O plano gratuito da Vercel tem limite de deploys.

### ✅ Solução: Limpar Projetos Antigos

1. **Acesse o Dashboard da Vercel**
   - Vá para [vercel.com/dashboard](https://vercel.com/dashboard)

2. **Delete os Projetos Antigos**
   - Para cada projeto (radar-lgpd-2kzz, radar-lgpd-3phw, etc.):
     - Clique no projeto
     - Vá em **Settings**
     - Role até o final
     - Clique em **Delete Project**
     - Confirme a exclusão

3. **Mantenha Apenas o Projeto Principal**
   - Mantenha apenas o projeto **radar-lgpd** (o principal)
   - Delete todos os outros projetos de preview

4. **Aguarde 24 Horas**
   - Após deletar os projetos, aguarde 24 horas para o limite resetar
   - Ou entre em contato com o suporte da Vercel para reset imediato

### 🔄 Alternativa: Usar Outra Plataforma

Enquanto espera, use uma das alternativas gratuitas:

#### **Netlify** (Recomendado)
1. Acesse [netlify.com](https://netlify.com)
2. Clique em **Add new site** → **Import an existing project**
3. Conecte seu GitHub
4. Selecione o repositório
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Clique em **Deploy site**

#### **Cloudflare Pages** (Recomendado)
1. Acesse [pages.cloudflare.com](https://pages.cloudflare.com)
2. Clique em **Create a project**
3. Conecte seu GitHub
4. Selecione o repositório
5. Configure:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Clique em **Save and Deploy**

#### **GitHub Pages** (Já Configurado)
1. Vá em **Settings** → **Pages**
2. Em **Source**, selecione **GitHub Actions**
3. O workflow será executado automaticamente
4. Site disponível em: `https://seu-usuario.github.io/radar-lgpd`

---

## 🔀 Problema 2: Conflitos de Merge

A mensagem "Este ramo apresenta conflitos que precisam ser resolvidos" indica que há conflitos entre branches.

### ✅ Solução: Resolver Conflitos

#### Opção 1: Resolver Localmente

```bash
# 1. Clone o repositório (se ainda não fez)
git clone https://github.com/serberohades/radar-lgpd.git
cd radar-lgpd

# 2. Busque as mudanças mais recentes
git fetch origin

# 3. Mude para a branch main
git checkout main

# 4. Faça merge com a branch develop (ou a branch com conflitos)
git merge origin/develop

# 5. Se houver conflitos, o Git mostrará os arquivos conflitantes
# Abra cada arquivo conflitante e resolva os conflitos manualmente

# 6. Após resolver todos os conflitos
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

#### Opção 2: Resolver no GitHub

1. Vá para o repositório no GitHub
2. Se houver um Pull Request aberto com conflitos:
   - Clique no PR
   - Clique em **Resolve conflicts**
   - Resolva os conflitos manualmente
   - Clique em **Mark as resolved**
   - Clique em **Commit merge**

#### Opção 3: Forçar Push (CUIDADO!)

**⚠️ ATENÇÃO**: Isso sobrescreverá o histórico do branch. Use apenas se tiver certeza.

```bash
# Faça backup do estado atual primeiro
git branch backup-branch

# Force push para sobrescrever o branch
git push origin main --force
```

---

## 🎯 Recomendação: Usar Netlify ou Cloudflare Pages

Enquanto resolve os problemas da Vercel, use uma das alternativas:

### **Netlify** (Mais Fácil)

1. Acesse [app.netlify.com](https://app.netlify.com)
2. Faça login com GitHub
3. Clique em **Add new site** → **Import an existing project**
4. Selecione o repositório **radar-lgpd**
5. Configure:
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Clique em **Deploy site**
7. Aguarde 2-3 minutos
8. Site disponível em: `https://radar-lgpd.netlify.app`

**Vantagens:**
- Deploy ilimitado no plano gratuito
- Deploy automático a cada push
- Domínio gratuito: `seu-projeto.netlify.app`
- SSL automático
- CDN global

### **Cloudflare Pages** (Mais Rápido)

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com)
2. Vá em **Workers & Pages**
3. Clique em **Create application** → **Pages**
4. Clique em **Connect to Git**
5. Selecione o repositório **radar-lgpd**
6. Configure:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
7. Clique em **Save and Deploy**
8. Site disponível em: `https://radar-lgpd.pages.dev`

**Vantagens:**
- Deploy ilimitado no plano gratuito
- Deploy automático a cada push
- Domínio gratuito: `seu-projeto.pages.dev`
- CDN global (mais rápido que Vercel)
- SSL automático

---

## 📋 Passo a Passo Completo

### 1. Resolver Conflitos (se houver)

```bash
# Clone o repositório
git clone https://github.com/serberohades/radar-lgpd.git
cd radar-lgpd

# Verifique o status
git status

# Se houver conflitos, resolva-os
# Depois faça commit
git add .
git commit -m "Resolve conflicts"
git push origin main
```

### 2. Fazer Deploy no Netlify

1. Acesse [app.netlify.com](https://app.netlify.com)
2. Faça login com GitHub
3. Clique em **Add new site** → **Import an existing project**
4. Selecione o repositório **radar-lgpd**
5. Configure:
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Clique em **Deploy site**
7. Aguarde 2-3 minutos
8. Site disponível em: `https://radar-lgpd.netlify.app`

### 3. Fazer Deploy no Cloudflare Pages

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com)
2. Vá em **Workers & Pages**
3. Clique em **Create application** → **Pages**
4. Clique em **Connect to Git**
5. Selecione o repositório **radar-lgpd**
6. Configure:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
7. Clique em **Save and Deploy**
8. Site disponível em: `https://radar-lgpd.pages.dev`

---

## 🔧 Limpar Projetos da Vercel

Se quiser continuar usando a Vercel:

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Para cada projeto de preview (radar-lgpd-2kzz, radar-lgpd-3phw, etc.):
   - Clique no projeto
   - Vá em **Settings**
   - Role até o final
   - Clique em **Delete Project**
   - Confirme a exclusão
3. Mantenha apenas o projeto principal **radar-lgpd**
4. Aguarde 24 horas para o limite resetar
5. Ou entre em contato com o suporte da Vercel

---

## 📞 Suporte

### Vercel
- [vercel.com/support](https://vercel.com/support)
- [vercel.com/docs](https://vercel.com/docs)

### Netlify
- [answers.netlify.com](https://answers.netlify.com)
- [docs.netlify.com](https://docs.netlify.com)

### Cloudflare Pages
- [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)

### GitHub
- [docs.github.com](https://docs.github.com)

---

## ✅ Resumo

**Problema 1: Limite de Deploy Vercel**
- Delete os projetos de preview antigos
- Aguarde 24 horas ou use Netlify/Cloudflare Pages

**Problema 2: Conflitos de Merge**
- Resolva os conflitos localmente ou no GitHub
- Faça push após resolver

**Recomendação:**
- Use **Netlify** ou **Cloudflare Pages** enquanto resolve os problemas da Vercel
- Ambos são gratuitos e ilimitados
- Deploy automático a cada push

---

Desenvolvido com ❤️ por Radar GRC
