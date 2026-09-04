<p align="center">
  <img src="public/favicon.svg" width="72" height="72" alt="Radar GRC" />
</p>

<h1 align="center">Radar GRC</h1>
<p align="center">
  <strong>LGPD · GDPR · ISO 27001/27002/27017/27701 · ISO 31000/37001/37301 — com IA</strong><br/>
  Plataforma de Governança, Risco e Conformidade que roda <em>100% no navegador</em>.
</p>

---

## O que é

O **Radar GRC** é uma plataforma de privacidade e compliance que unifica, em um só lugar:

- 🇧🇷 **LGPD** — registro de atividades de tratamento (art. 37), matriz de risco 5×5, bases legais (arts. 7º/11), fila de titulares (prazo de 15 dias) e checklist de conformidade;
- 🇪🇺 **GDPR** — ROPA (Art. 30), bases de licitude (Art. 6/9/10), DPIA com os 9 critérios do EDPB (WP248) e gestão de transferências internacionais (Capítulo V);
- 📋 **Frameworks ISO** — programas de implementação com controles reais, evidências, maturidade e **gerador de planos com IA** para as normas 27001, 27002, 27017, 27701, 31000, 37001 e 37301;
- 🤖 **Assistente de IA** — classificação de operações, recomendação de base legal, retenção, salvaguardas e risco — **heurística local, nenhum dado sai do navegador**;
- 🔒 **Segurança** — senhas com hash SHA-256+salt, bloqueio anti força-bruta, trilha de auditoria e script de hardening do servidor para download.

## Acesso de demonstração

| Campo  | Valor                  |
| ------ | ---------------------- |
| E-mail | `demo@radarlgpd.app`   |
| Senha  | `demo1234`             |

> Você também pode **criar sua própria conta** na tela inicial. Cada usuário tem dados isolados (persistência local).

## Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS 4** (design system próprio: Bricolage Grotesque + Instrument Sans)
- Ícones SVG inline (sem dependência externa)
- Persistência via `localStorage` / `sessionStorage` (sem backend)

## Rodando localmente

```bash
npm install
npm run dev        # abre em http://localhost:5173
npm run build      # gera a pasta dist/
```

## Deploy na Vercel

O projeto já está pronto: há um `vercel.json` com rewrites de SPA e headers de segurança (CSP, HSTS, etc.).

1. Suba este repositório para o GitHub;
2. Na [Vercel](https://vercel.com), **Import Project** → selecione o repositório;
3. A Vercel detecta o framework **Vite** automaticamente (`build: npm run build`, `output: dist`);
4. Deploy. ✅

> Após o deploy, atualize as tags `og:image` / `og:url` no `index.html` com a URL absoluta do seu domínio (ex.: `https://seu-app.vercel.app/og.png`).

### Se aparecer `404: NOT_FOUND`

O `vercel.json` é **mínimo de propósito** (só rewrite de SPA + headers de segurança) — a Vercel detecta o Vite sozinha pelo `package.json`, então há menos pontos de conflito com o painel. Se o erro persistir, o problema quase nunca é o código — siga este checklist na ordem:

1. **Aba Deployments** — existe algum deployment com status verde **Ready**?
   - ❌ **Error** → clique nele e leia o build log; a causa aparece nas primeiras linhas vermelhas (geralmente dependências ou versão do Node). Em *Project Settings → General*, fixe **Node.js Version = 22.x**.
   - ⚠️ **Nenhum deployment** → o push não disparou build: confira se a branch que você enviou (`main` ou `master`) é a mesma configurada em *Settings → Git → Production Branch*, e se o Vercel App tem acesso ao repositório (*GitHub → Settings → Applications → Vercel → Configure*).
2. **Estrutura do repositório (causa nº 1)** — o `package.json` precisa estar na **raiz**. Valide com:
   ```bash
   git clone https://github.com/SEU-USUARIO/radar-grc.git && cd radar-grc
   ls package.json index.html vercel.json src   # tudo precisa existir AQUI, sem subpasta
   ```
   Se o código vive numa subpasta, informe-a em *Project Settings → General → Root Directory* (senão, deixe **vazio**).
3. **URL correta** — acesse a URL de produção `https://seu-projeto.vercel.app`, não a URL de um deployment específico que falhou.
4. **Rebuild limpo** — *Deployments → ⋯ → Redeploy*, desmarcando *"Use existing Build Cache"*.

> O `EU IA:gru1::…` no rodapé do erro é apenas a região do edge da Vercel (São Paulo) — é informação de diagnóstico, não a causa.

## Estrutura

```
src/
  ai.ts          # IA de classificação LGPD
  aiExtra.ts     # IA GDPR, planejador ISO e script de hardening
  auth.tsx       # autenticação, sessão e bloqueio anti força-bruta
  frameworks.ts  # 7 normas ISO e controles
  gdpr.ts        # domínio GDPR (bases, DPIA, transferências)
  store.tsx      # estado global + trilha de auditoria
  types.ts       # domínio LGPD e seeds
  components/    # telas (Dashboard, Assistant, Gdpr, Iso, Security…)
```

## Segurança

- Senhas nunca armazenadas em texto puro (SHA-256 + salt via Web Crypto);
- Bloqueio de conta após 5 tentativas (60s);
- Sessão e dados isolados por usuário;
- Headers de segurança aplicados via `vercel.json` (CSP, HSTS, X-Frame-Options, Referrer-Policy).

## Licença

MIT — veja [LICENSE](LICENSE).
