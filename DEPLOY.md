# Guia de Deploy - GitHub e Vercel

Este guia explica como fazer deploy do Radar GRC no GitHub Pages e na Vercel.

## 🚀 Deploy na Vercel (Recomendado)

### Passo a Passo

1. **Acesse a Vercel**
   - Vá para [vercel.com](https://vercel.com)
   - Faça login com sua conta GitHub

2. **Importe o Projeto**
   - Clique em **Add New** → **Project**
   - Selecione o repositório GitHub do Radar GRC
   - Clique em **Import**

3. **Configurações Automáticas**
   - A Vercel detectará automaticamente o `vercel.json`
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Não é necessário alterar nada

4. **Deploy**
   - Clique em **Deploy**
   - Aguarde o build ser concluído (cerca de 2-3 minutos)
   - Seu site estará disponível em: `https://seu-projeto.vercel.app`

5. **Deploy Automático**
   - A cada push na branch `main`, a Vercel fará deploy automaticamente
   - Você pode acompanhar o status em: **Deployments**

### Configurações do vercel.json

O arquivo `vercel.json` já está configurado com:

- **Rewrites**: Para suportar rotas do React Router
- **Headers de Segurança**: CSP, HSTS, X-Frame-Options, etc.
- **Cache**: Para assets estáticos

### Domínio Personalizado (Opcional)

Se quiser usar um domínio personalizado:

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio (ex: `app.seudominio.com`)
3. Configure o DNS conforme as instruções da Vercel
4. Aguarde a propagação do DNS (pode levar até 24 horas)

---

## 🐙 Deploy no GitHub Pages

### Passo a Passo

1. **Acesse o Repositório**
   - Vá para o repositório do Radar GRC no GitHub

2. **Configure o GitHub Pages**
   - Vá em **Settings** → **Pages**
   - Em **Source**, selecione **GitHub Actions**
   - O workflow `.github/workflows/deploy.yml` será usado automaticamente

3. **Deploy Automático**
   - O workflow será executado automaticamente a cada push na branch `main`
   - Você pode executar manualmente em: **Actions** → **Deploy — GitHub Pages** → **Run workflow**

4. **Acesse o Site**
   - O site será publicado em: `https://seu-usuario.github.io/nome-do-repositorio`
   - Exemplo: `https://seu-usuario.github.io/radar-grpc`

### Workflow do GitHub Actions

O arquivo `.github/workflows/deploy.yml` já está configurado com:

- **Trigger**: Push na branch `main` ou `master`
- **Build**: `npm run build -- --base=./`
- **Deploy**: Usa `actions/deploy-pages@v4`

### Base Relativa

O build usa `--base=./` para garantir que funcione tanto na raiz quanto em subpastas do GitHub Pages.

### Domínio Personalizado (Opcional)

Se quiser usar um domínio personalizado:

1. Vá em **Settings** → **Pages** → **Custom domain**
2. Adicione seu domínio (ex: `app.seudominio.com`)
3. Configure o DNS conforme as instruções do GitHub
4. Aguarde a propagação do DNS

---

## 🔧 Comandos Úteis

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# O site estará disponível em: http://localhost:5173
```

### Build de Produção

```bash
# Build para produção
npm run build

# O build gerará a pasta dist/
```

### Preview do Build

```bash
# Preview do build de produção
npm run preview

# O site estará disponível em: http://localhost:4173
```

### Verificar Tipos TypeScript

```bash
# Verificar tipos TypeScript
npm run typecheck
```

---

## 📋 Checklist de Deploy

### Para Vercel

- [ ] Repositório conectado à Vercel
- [ ] `vercel.json` configurado corretamente
- [ ] Build concluído com sucesso
- [ ] Site acessível na URL da Vercel
- [ ] Deploy automático configurado
- [ ] Domínio personalizado configurado (opcional)

### Para GitHub Pages

- [ ] Workflow `.github/workflows/deploy.yml` configurado
- [ ] GitHub Pages configurado para usar GitHub Actions
- [ ] Build concluído com sucesso
- [ ] Site acessível na URL do GitHub Pages
- [ ] Deploy automático configurado
- [ ] Domínio personalizado configurado (opcional)

---

## 🐛 Troubleshooting

### Vercel: Erro 404

Se você ver erro 404 na Vercel:

1. Verifique se o `vercel.json` está na raiz do repositório
2. Verifique se o Framework Preset está como **Vite**
3. Verifique se o Build Command está como `npm run build`
4. Verifique se o Output Directory está como `dist`
6. Verifique os logs de build em **Deployments**

### GitHub Pages: Site não carrega

Se o site não carrega no GitHub Pages:

1. Verifique se o GitHub Pages está configurado para usar **GitHub Actions**
2. Verifique se o workflow foi executado com sucesso em **Actions**
4. Verifique se o build foi concluído com sucesso
5. Aguarde alguns minutos para propagação

### Build Falhou

Se o build falhar:

1. Verifique os logs de build
2. Verifique se todas as dependências estão instaladas
3. Verifique se não há erros de TypeScript
4. Execute `npm run build` localmente para testar

---

## 📞 Suporte

Se precisar de ajuda:

- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Pages**: [docs.github.com](https://docs.github.com)
- **Vite**: [vitejs.dev](https://vitejs.dev)
- **React**: [vite.dev](https://vite.dev)

---

## 📝 Notas Importantes

- O projeto usa **Vite** como build tool
- O projeto usa **React 18** com **TypeScript**
- O projeto usa **Tailwind CSS** para estilização
- O build gera arquivos estáticos na pasta `dist`
- Ambos Vercel e GitHub Pages servem esses arquivos estáticos automaticamente

---

Desenvolvido com ❤️ por Radar GRC
