# Solução para o Erro do Render

## Problema

O Render está mostrando o erro:
```
Start Command
Render runs this command to start your app with each deploy.
$
yarn start
Required render
```

## Causa

O Render está configurado como **Web Service** (que espera um servidor Node.js rodando), mas seu projeto é um **Static Site** (apenas arquivos estáticos HTML/CSS/JS).

## Solução

### Opção 1: Mudar para Static Site (Recomendado)

1. Acesse [Render Dashboard](https://dashboard.render.com/)
2. Clique no seu service
3. Vá em **Settings**
4. Encontre **Environment**
5. Mude de **Web Service** para **Static Site**
6. Configure:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
7. Clique em **Save Changes**
8. O Render vai fazer rebuild automaticamente

### Opção 2: Criar Novo Service como Static Site

Se não conseguir mudar o tipo:

1. Acesse [Render Dashboard](https://dashboard.render.com/)
2. Clique em **New** → **Static Site**
3. Conecte seu repositório GitHub
4. Configure:
   - **Name**: radar-grpc (ou o nome que preferir)
   - **Branch**: main (ou a branch que você usa)
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Start Command**: Deixe em branco (não é necessário para Static Site)
5. Clique em **Create Static Site**

### Opção 3: Usar render.yaml (Automático)

O arquivo `render.yaml` já está configurado. Se o Render detectar este arquivo, ele usará as configurações automaticamente.

Verifique se o arquivo `render.yaml` está na raiz do repositório com o conteúdo:

```yaml
services:
  - type: web
    name: radar-grpc
    env: static
    buildCommand: npm run build
    staticPublishPath: ./dist
    routes:
      - type: rewrite
        source: /**
        destination: /index.html
```

## Verificação

Após fazer as alterações:

1. Verifique nos logs do Render se o build está executando:
   ```
   ==> Building...
   ==> npm run build
   ==> vite v6.3.5 building for production...
   ==> ✓ built in X.XXs
   ```

2. Verifique se o site está acessível na URL do Render

## Se Ainda Não Funcionar

### Verifique os Logs

1. Acesse seu service no Render Dashboard
2. Clique em **Logs**
3. Verifique se há erros de build
4. Verifique se o build foi concluído com sucesso

### Verifique as Configurações

1. **Environment Type**: Deve ser **Static Site**
2. **Build Command**: Deve ser `npm run build`
3. **Publish Directory**: Deve ser `dist`
4. **Start Command**: Pode ficar em branco para Static Site

### Verifique o repositório

Certifique-se de que todos os arquivos estão no repositório:
- [ ] `package.json`
- [ ] `package-lock.json`
- [ ] `render.yaml`
- [ ] `vite.config.ts`
- [ ] Pasta `src/`
- [ ] Pasta `public/`

## Comandos Úteis

### Build Local (para testar)

```bash
npm run build
```

Isso gera a pasta `dist` com os arquivos estáticos.

### Preview Local

```bash
npm run preview
```

Isso inicia um servidor local para testar o build de produção.

## Contato

Se ainda tiver problemas:
- [Render Documentation](https://render.com/docs/static-sites)
- [Render Support](https://render.com/support)

## Resumo

O problema é que o Render está configurado como **Web Service** em vez de **Static Site**. Mude para **Static Site** e configure:
- Build Command: `npm run build`
- Publish Directory: `dist`

Isso deve resolver o problema!
