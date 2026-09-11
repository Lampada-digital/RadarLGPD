# 🚀 Guia Rápido: GitHub + Vercel Deploy

## ✅ Passo 1: Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name**: `radar-grc` (ou outro nome)
   - **Description**: "Sistema GRC White Label - LGPD, GDPR, ISO"
   - **Public/Private**: Escolha conforme necessário
   - **NÃO marque** "Add a README" (já existe)
3. Clique em **Create repository**

## ✅ Passo 2: Enviar Código para GitHub

Abra o terminal na pasta do projeto e execute:

```bash
# Inicializar git
git init

# Adicionar todos os arquivos
git add .

# Commit inicial
git commit -m "Initial commit - Radar GRC White Label"

# Adicionar remote (substitua SEU-USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU-USUARIO/radar-grc.git

# Fazer push
git branch -M main
git push -u origin main
```

## ✅ Passo 3: Deploy no Vercel

1. Acesse: https://vercel.com/new
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

## 🔐 Credenciais de Acesso

Após o deploy, acesse o sistema com:

**Conta Root (Admin Master):**
- Email: `root@radargrc.app`
- Senha: `Root#Radar2026`

**Conta Demo:**
- Email: `demo@radarlgpd.app`
- Senha: `demo1234`

## 🎨 Configurar White Label

Após acessar o sistema:

1. Vá em **Administração → White Label**
2. Configure:
   - Nome da Plataforma
   - Nome da Empresa
   - Upload do Logo
   - Cores personalizadas
   - Informações de contato
3. Clique em **Salvar Configurações**

## 🌐 Domínio Personalizado (Opcional)

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

## 📝 Comandos Úteis

```bash
# Ver status do git
git status

# Adicionar mudanças
git add .

# Commit com mensagem
git commit -m "Mensagem descritiva"

# Push para GitHub
git push origin main

# Ver logs
git log --oneline
```

## ✅ Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Código enviado com `git push`
- [ ] Projeto importado no Vercel
- [ ] Deploy concluído com sucesso
- [ ] Sistema acessível pela URL
- [ ] Login funcionando
- [ ] White Label configurado

## 🆘 Problemas Comuns

**Erro: "Repository not found"**
- Verifique se o repositório foi criado corretamente
- Verifique se você tem permissão de acesso

**Erro: "Build failed"**
- Verifique se todos os arquivos foram enviados
- Verifique os logs de erro no Vercel

**Erro: "Page not found"**
- Aguarde alguns minutos para propagação
- Verifique se o build foi concluído com sucesso

## 📞 Suporte

- Vercel Docs: https://vercel.com/docs
- GitHub Docs: https://docs.github.com

---

**Pronto!** Seu Radar GRC está no ar! 🎉
