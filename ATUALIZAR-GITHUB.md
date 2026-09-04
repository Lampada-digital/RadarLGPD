# Como levar as alterações para o GitHub (e o Vercel atualizar sozinho)

> **Importante:** este ambiente de edição **não envia código para o seu GitHub automaticamente**.
> Enquanto os arquivos não forem sincronizados com o repositório, o Vercel **não tem como saber**
> que existe versão nova — por isso o site publicado continua antigo.
>
> O Vercel só faz redeploy **quando recebe um push** no repositório conectado.

---

## O que mudou desde o último upload

Muita coisa foi adicionada/corrigida. Se você subir só alguns arquivos, o build quebra.
**Sincronize o projeto inteiro** (métodos abaixo). Destaques do que é NOVO:

| Caminho | Status |
|---|---|
| `api/banner.ts` | 🆕 API serverless do banner de cookies (Vercel) |
| `src/apiClient.ts` | 🆕 cliente da API |
| `src/protection.ts` | 🆕 camada anticópia/antinspeção |
| `src/components/Plans.tsx` | 🆕 Assinatura R$ 149 + trial 7 dias |
| `src/components/AdminPanel.tsx` | 🆕 gestão de usuários |
| `src/components/Cookies.tsx` | ✏️ gestão de cookies + API |
| `src/auth.tsx`, `src/App.tsx`, `src/store.tsx` | ✏️ reescritos |
| `src/cookies.ts`, `src/isoDocs.ts`, `src/frameworks.ts` | ✏️ atualizados |
| `vercel.json` | ✏️ corrigido (sem rewrite que quebrava o deploy) |

---

## Método 1 — Terminal (o mais rápido e confiável)

Requisito: [Git](https://git-scm.com/downloads) instalado. Abra o terminal **dentro da pasta do projeto**:

```bash
git init
git add .
git commit -m "Radar GRC — versão completa (LGPD, GDPR, ISO, IA, API do banner)"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPO.git
git push -f origin main
```

> O `push -f` sobrescreve o histórico antigo do repositório — é o jeito mais simples de
> garantir que o GitHub fique **idêntico** a esta pasta.
>
> Se o Git pedir senha, use um **Personal Access Token**:
> GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) →
> Generate new token → marque `repo`.

---

## Método 2 — Pelo site do GitHub (sem terminal)

1. Abra o repositório no GitHub;
2. **Apague tudo que está lá** (selecionar todos os arquivos → delete) para evitar conflitos com versão velha;
3. Clique em **Add file → Upload files** e arraste **todos** os itens desta pasta:

   📁 pastas: `src`, `public`, `api`, `.github` (oculta)
   📄 arquivos: `package.json`, `package-lock.json`, `index.html`, `tsconfig.json`,
   `vite.config.js`, `vercel.json`, `netlify.toml`, `.gitignore`, `LICENSE`, `README.md`

   ⚠️ **NÃO envie** `node_modules` nem `dist`.
   Para ver `.github` e `.gitignore`: Windows → *Exibir → Itens ocultos* · Mac → `Cmd + Shift + .`

4. Escreva a mensagem do commit e clique em **Commit changes**.

---

## Como confirmar que o Vercel atualizou

1. No Vercel, abra o projeto → aba **Deployments**;
2. Deve aparecer um **novo deployment** com o hash do commit que você acabou de enviar;
3. Aguarde ficar **verde (Ready)** — leva ~1 min;
4. Abra o site e dê um refresh forçado (`Ctrl + Shift + R`);
5. O rodapé da sidebar mostra **v2.x** e as novas seções (Assinatura, API do banner, etc.).

## E a API do banner?

Ao subir a pasta `api/`, a Vercel cria automaticamente o endpoint `https://SEU-SITE.vercel.app/api/banner`.
Na página **Gestão de Cookies → API do banner**, clique em **Testar conexão** — deve ficar **online**.

> No GitHub Pages não existem funções serverless, então a API só funciona na **Vercel** (ou Netlify/Cloudflare).
