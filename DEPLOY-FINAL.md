# 🚀 DEPLOY FINAL - GitHub + Vercel

## ✅ Sistema Completo com Proteções

O sistema agora inclui:
- ✅ White Label completo (cores, logo, textos)
- ✅ Proteção contra impressão
- ✅ Proteção contra Print Screen
- ✅ Proteção contra DevTools
- ✅ Proteção contra seleção de texto
- ✅ Detecção de gravação de tela

## 📋 Deploy em 3 Passos

### 1️⃣ Criar Repositório no GitHub

1. Acesse: **https://github.com/new**
2. Preencha:
   - **Repository name**: `radar-grc`
   - **Description**: `Sistema GRC White Label com proteções de segurança`
   - Marque: **Public** (ou Private)
   - **NÃO marque** "Add a README file"
3. Clique em **Create repository**

### 2️⃣ Enviar Código para GitHub

Abra o terminal na pasta do projeto e execute:

```bash
# Inicializar git
git init

# Adicionar todos os arquivos
git add .

# Commit com todas as proteções
git commit -m "Sistema completo com white label e proteções de segurança"

# Adicionar remote (SUBSTITUA SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/radar-grc.git

# Fazer push
git branch -M main
git push -u origin main
```

### 3️⃣ Deploy no Vercel

1. Acesse: **https://vercel.com/new**
2. Clique em **Import Git Repository**
3. Selecione o repositório `radar-grc`
4. Clique em **Import**
5. Configurações automáticas:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Clique em **Deploy**
7. Aguarde 2-3 minutos
8. Acesse a URL gerada

## 🔐 Credenciais de Acesso

### Conta Root (Admin Master)
- **Email**: `root@radargrc.app`
- **Senha**: `Root#Radar2026`

### Conta Demo
- **Email**: `demo@radarlgpd.app`
- **Senha**: `demo1234`

## 🎨 Configurar White Label

Após o deploy:

1. Acesse o sistema
2. Faça login com as credenciais root
3. Vá em **Administração → White Label**
4. Configure:
   - Nome da Plataforma
   - Nome da Empresa
   - Upload do Logo
   - Cores personalizadas
   - Informações de contato
5. Clique em **Salvar Configurações**
6. Recarregue a página para ver as mudanças

## 🛡️ Proteções Ativas

O sistema inclui proteções contra:

- ✅ **Impressão** (Ctrl+P, Cmd+P)
- ✅ **Print Screen** (tecla Print Screen)
- ✅ **DevTools** (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U)
- ✅ **Seleção de texto** (mouse e teclado)
- ✅ **Arrastar imagens** (drag & drop)
- ✅ **Gravação de tela** (detecção de APIs)

## 🌐 Domínio Personalizado (Opcional)

Para usar seu domínio (ex: `grc.suaempresa.com.br`):

1. No Vercel: **Settings → Domains → Add**
2. Digite seu domínio
3. No seu DNS, adicione:
   ```
   Tipo: CNAME
   Nome: grc
   Valor: cname.vercel-dns.com
   ```
4. Aguarde propagação (até 24h)

## ✅ Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Código enviado com `git push`
- [ ] Projeto importado no Vercel
- [ ] Deploy concluído com sucesso
- [ ] Sistema acessível pela URL
- [ ] Login funcionando
- [ ] White Label configurado
- [ ] Proteções de segurança ativas

## 🆘 Problemas Comuns

**Erro: "Repository not found"**
- Verifique se o repositório foi criado
- Verifique permissões de acesso

**Erro: "Build failed"**
- Verifique se todos os arquivos foram enviados
- Verifique logs no Vercel

**Erro: "Page not found"**
- Aguarde alguns minutos
- Verifique se o build foi concluído

## 📞 Suporte

- Vercel Docs: https://vercel.com/docs
- GitHub Docs: https://docs.github.com

---

**PRONTO!** Seu Radar GRC com white label e proteções de segurança está no ar! 🎉
