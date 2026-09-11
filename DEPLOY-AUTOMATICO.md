# 🚀 Deploy Automático - Radar GRC

## Como Usar o Script de Deploy

Este script faz push automático para o GitHub e deploy na Vercel.

### Pré-requisitos

1. **Node.js** instalado (https://nodejs.org)
2. **Git** instalado (https://git-scm.com)
3. **Token do GitHub** (https://github.com/settings/tokens)
   - Clique em "Generate new token (classic)"
   - Marque as permissões: `repo` (full control)
   - Copie o token gerado

4. **Token da Vercel** (opcional) (https://vercel.com/account/tokens)
   - Clique em "Create Token"
   - Copie o token gerado

### Executando o Script

```bash
# Tornar o script executável
chmod +x deploy.js

# Executar o script
node deploy.js
```

O script irá:
1. Perguntar seu token do GitHub
2. Perguntar seu usuário do GitHub
3. Perguntar o nome do repositório (padrão: radar-grc)
4. Perguntar se deseja fazer deploy na Vercel
5. Se sim, pedir o token da Vercel
6. Criar o repositório automaticamente
7. Fazer push de todos os arquivos
8. Fazer deploy na Vercel (se configurado)

### Exemplo de Execução

```bash
$ node deploy.js

🚀 Deploy Automático - Radar GRC

Este script irá:
1. Criar repositório no GitHub
2. Fazer push de todos os arquivos
3. Conectar com Vercel para deploy

📋 Informações necessárias:

🔑 Token do GitHub (https://github.com/settings/tokens): ghp_xxxxxxxxxxxxxxxxxxxx
👤 Seu usuário do GitHub: seu-usuario
📦 Nome do repositório (padrão: radar-grc): radar-grc

🔗 Deseja fazer deploy na Vercel? (s/n): s
🔑 Token da Vercel (https://vercel.com/account/tokens): xxxxxxxxxxxxxxxxxxxx

⚙️  Configurando repositório...
✅ Arquivos adicionados ao git

📦 Criando repositório no GitHub...
✅ Repositório criado: https://github.com/seu-usuario/radar-grc

📤 Fazendo push dos arquivos...
✅ Push concluído com sucesso

🚀 Fazendo deploy na Vercel...
✅ Deploy na Vercel concluído!

🌐 URL do seu projeto:
https://radar-grc.vercel.app

✨ Deploy concluído com sucesso!

📋 Próximos passos:
1. Acesse: https://github.com/seu-usuario/radar-grc
2. Configure o White Label no painel admin
3. Use as credenciais: root@radargrc.app / Root#Radar2026
```

### Alternativa: Deploy Manual

Se preferir fazer manualmente:

```bash
# 1. Inicializar git
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Commit
git commit -m "Initial commit - Radar GRC"

# 4. Criar repositório no GitHub manualmente
# Acesse: https://github.com/new

# 5. Adicionar remote
git remote add origin https://github.com/SEU-USUARIO/radar-grc.git

# 6. Push
git branch -M main
git push -u origin main

# 7. Conectar com Vercel
# Acesse: https://vercel.com/new
# Importe o repositório
```

### Credenciais de Acesso

Após o deploy, acesse o sistema com:

- **Email**: `root@radargrc.app`
- **Senha**: `Root#Radar2026`

### Configurando White Label

1. Acesse o sistema pela URL do Vercel
2. Faça login com as credenciais acima
3. Vá em **Administração → White Label**
4. Configure:
   - Nome da Plataforma
   - Nome da Empresa
   - Upload do Logo
   - Cores personalizadas
   - Informações de contato
5. Clique em **Salvar Configurações**
6. Recarregue a página (F5)

### Problemas Comuns

**Erro: "Token inválido"**
- Verifique se o token foi copiado corretamente
- Verifique se o token tem as permissões corretas

**Erro: "Repositório já existe"**
- Escolha outro nome para o repositório
- Ou delete o repositório existente no GitHub

**Erro: "Permission denied"**
- Verifique se o token tem permissão de escrita
- Verifique se você é o dono do repositório

### Suporte

- GitHub Docs: https://docs.github.com
- Vercel Docs: https://vercel.com/docs
- GitHub Tokens: https://github.com/settings/tokens
- Vercel Tokens: https://vercel.com/account/tokens

---

**Pronto!** Seu Radar GRC estará no ar em poucos minutos! 🚀
