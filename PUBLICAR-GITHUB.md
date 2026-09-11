# 🚀 GUIA SIMPLES: Publicar no GitHub

## ✅ Problema Resolvido!

O bloqueio do DevTools foi removido. Agora você pode publicar normalmente!

---

## 📋 Passo a Passo Simples

### 1️⃣ Criar Repositório no GitHub

1. Acesse: **https://github.com/new**
2. Preencha:
   - **Repository name**: `radar-grc`
   - **Description**: `Sistema GRC White Label`
   - Marque: **Public**
   - **NÃO marque** "Add a README file"
3. Clique em **Create repository**

### 2️⃣ Enviar Código

Abra o terminal na pasta do projeto e execute:

```bash
# Inicializar git
git init

# Adicionar todos os arquivos
git add .

# Commit
git commit -m "Initial commit - Radar GRC"

# Renomear branch
git branch -M main

# Adicionar remote (SUBSTITUA SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/radar-grc.git

# Fazer push
git push -u origin main
```

### 3️⃣ Deploy no Vercel

1. Acesse: **https://vercel.com/new**
2. Clique em **Import Git Repository**
3. Selecione o repositório `radar-grc`
4. Clique em **Import**
5. Clique em **Deploy**
6. Aguarde 2-3 minutos

---

## 🔐 Credenciais de Acesso

Após o deploy, acesse com:
- **Email**: `root@radargrc.app`
- **Senha**: `Root#Radar2026`

---

## 🎨 Configurar White Label

1. Acesse o sistema
2. Vá em **Administração → Painel admin**
3. Clique na aba **White Label**
4. Configure cores, logo e informações
5. Salve e recarregue a página

---

## ❓ Problemas?

### Se pedir autenticação:
1. Acesse: https://github.com/settings/tokens
2. Clique em **Generate new token (classic)**
3. Marque: **✅ repo**
4. Copie o token e use como senha

### Se der erro de remote:
```bash
git remote remove origin
git remote add origin https://github.com/SEU-USUARIO/radar-grc.git
git push -u origin main
```

---

## ✅ Pronto!

Seu Radar GRC está no ar e pronto para uso! 🎉
