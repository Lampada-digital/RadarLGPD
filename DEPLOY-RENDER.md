# Radar GRC - Deploy no Render

## Configuração do Render

### Opção 1: Usando render.yaml (Recomendado)

O arquivo `render.yaml` já está configurado com as configurações corretas para deploy como Static Site.

1. Acesse [Render Dashboard](https://dashboard.render.com/)
2. Clique em **New** → **Static Site**
3. Conecte seu repositório GitHub
4. O Render detectará automaticamente o `render.yaml`
5. Clique em **Create Static Site**

### Opção 2: Configuração Manual

Se preferir configurar manualmente:

1. Acesse [Render Dashboard](https://dashboard.render.com/)
2. Clique em **New** → **Web Service**
3. Conecte seu repositório GitHub
4. Configure as seguintes opções:
   - **Name**: radar-grpc (ou o nome que preferir)
   - **Environment**: `Static Site`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Start Command**: `npm start`

5. Clique em **Create Web Service**

## Configurações Importantes

### Environment Type
- Selecione **Static Site** (não Web Service)
- Isso garante que o Render sirva os arquivos estáticos da pasta `dist`

### Build Command
```bash
npm run build
```

### Publish Directory
```
dist
```

### Start Command (se necessário)
```bash
npm start
```

## Rotas e SPA

O arquivo `render.yaml` já está configurado com rewrites para suportar SPA (Single Page Application):

```yaml
routes:
  - type: rewrite
    source: /**
    destination: /index.html
```

Isso garante que todas as rotas do React Router funcionem corretamente.

## Headers de Segurança

Os headers de segurança já estão configurados no `render.yaml`:

- `X-Frame-Options: DENY` - Previne clickjacking
- `X-Content-Type-Options: nosniff` - Previne MIME type sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Controla referrer information

## Deploy Automático

O Render configurará deploy automático a cada push na branch `main` (ou a branch que você configurar).

## Variáveis de Ambiente (se necessário)

Se seu projeto precisar de variáveis de ambiente:

1. Acesse seu service no Render Dashboard
2. Vá em **Environment**
3. Adicione as variáveis necessárias

## Troubleshooting

### Erro: "yarn start" Required

Se você ver este erro:
1. Verifique se o `render.yaml` está na raiz do repositório
2. Verifique se o tipo de ambiente é **Static Site**
3. Verifique se o Build Command está correto: `npm run build`
4. Verifique se o Publish Directory está correto: `dist`

### Erro: Página não encontrada

Se as rotas não funcionarem:
1. Verifique se o `render.yaml` tem as rotas configuradas
2. Verifique se o `vite.config.ts` está configurado corretamente
3. Verifique se o build foi concluído com sucesso

### Erro: Build falhou

Se o build falhar:
1. Verifique os logs de build no Render Dashboard
2. Verifique se todas as dependências estão instaladas
3. Verifique se não há erros de TypeScript
4. Execute `npm run build` localmente para testar

## Suporte

Para mais informações, consulte:
- [Render Documentation](https://render.com/docs)
- [Render Static Sites](https://render.com/docs/static-sites)

## Comandos Úteis

### Build Local
```bash
npm run build
```

### Preview Local
```bash
npm run preview
```

### Desenvolvimento Local
```bash
npm run dev
```

## Estrutura do Projeto

```
radar-grpc/
├── src/              # Código fonte React
├── public/           # Arquivos estáticos públicos
├── dist/             # Build de produção (gerado pelo Vite)
├── render.yaml       # Configuração do Render
├── package.json      # Dependências e scripts
└── vite.config.ts    # Configuração do Vite
```

## Notas Importantes

- O projeto usa **Vite** como build tool
- O projeto usa **React 18** com **TypeScript**
- O projeto usa **Tailwind CSS** para estilização
- O build gera arquivos estáticos na pasta `dist`
- O Render serve esses arquivos estáticos automaticamente

## Checklist de Deploy

- [ ] Repositório conectado ao Render
- [ ] `render.yaml` configurado corretamente
- [ ] Build Command: `npm run build`
- [ ] Publish Directory: `dist`
- [ ] Build concluído com sucesso
- [ ] Site acessível na URL do Render
- [ ] Rotas funcionando corretamente
- [ ] Headers de segurança configurados

## Contato

Se precisar de ajuda:
- [Render Support](https://render.com/support)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
