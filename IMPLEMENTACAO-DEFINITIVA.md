# 🚀 IMPLEMENTAÇÃO DEFINITIVA - GitHub + Vercel

## ⚡ PASSO A PASSO RÁPIDO (5 minutos)

### 1️⃣ CRIAR REPOSITÓRIO NO GITHUB

1. Acesse: **https://github.com/new**
2. Preencha:
   - **Repository name**: `radar-grc`
   - **Description**: `Sistema GRC White Label - LGPD, GDPR, ISO`
   - Marque: **Public** (ou Private se preferir)
   - **NÃO marque** "Add a README file"
3. Clique em **Create repository**

### 2️⃣ ENVIAR CÓDIGO PARA GITHUB

Abra o terminal na pasta do projeto e execute:

```bash
# Inicializar git
git init

# Adicionar todos os arquivos
git add .

# Commit inicial
git commit -m "Initial commit - Radar GRC White Label"

# Adicionar remote (SUBSTITUA SEU-USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU-USUARIO/radar-grc.git

# Fazer push
git branch -M main
git push -u origin main
```

### 3️⃣ DEPLOY NO VERCEL

1. Acesse: **https://vercel.com/new**
2. Clique em **Import Git Repository**
3. Selecione o repositório `radar-grc`
4. Clique em **Import**
5. O Vercel detectará automaticamente:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Clique em **Deploy**
7. Aguarde 2-3 minutos
8. Acesse a URL gerada (ex: `https://radar-grc.vercel.app`)

### 4️⃣ CONFIGURAR WHITE LABEL

Após o deploy:

1. Acesse o sistema
2. Faça login com:
   - **Email**: `root@radargrc.app`
   - **Senha**: `Root#Radar2026`
3. Vá em **Administração → White Label**
4. Configure:
   - Nome da Plataforma
   - Nome da Empresa
   - Upload do Logo
   - Cores personalizadas
   - Informações de contato
5. Clique em **Salvar Configurações**

## 🔐 CREDENCIAIS DE ACESSO

### Conta Root (Admin Master)
- **Email**: `root@radargrc.app`
- **Senha**: `Root#Radar2026`

### Conta Demo
- **Email**: `demo@radarlgpd.app`
- **Senha**: `demo1234`

## 🌐 DOMÍNIO PERSONALIZADO (Opcional)

Para usar seu próprio domínio (ex: `grc.suaempresa.com.br`):

1. No Vercel: **Settings → Domains → Add**
2. Digite seu domínio
3. No seu DNS, adicione:
   ```
   Tipo: CNAME
   Nome: grc (ou subdomínio)
   Valor: cname.vercel-dns.com
   ```
4. Aguarde propagação (até 24h)

## ✅ CHECKLIST FINAL

- [ ] Repositório criado no GitHub
- [ ] Código enviado com `git push`
- [ ] Projeto importado no Vercel
- [ ] Deploy concluído com sucesso
- [ ] Sistema acessível pela URL
- [ ] Login funcionando
- [ ] White Label configurado

## 🆘 PROBLEMAS COMUNS

**Erro: "Repository not found"**
- Verifique se o repositório foi criado corretamente
- Verifique se você tem permissão de acesso

**Erro: "Build failed"**
- Verifique se todos os arquivos foram enviados
- Verifique os logs de erro no Vercel

**Erro: "Page not found"**
- Aguarde alguns minutos para propagação
- Verifique se o build foi concluído com sucesso

## 📞 SUPORTE

- Vercel Docs: https://vercel.com/docs
- GitHub Docs: https://docs.github.com

---

**PRONTO!** Seu Radar GRC White Label está no ar! 🎉
