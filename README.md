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
- 📋 **Frameworks ISO** — programas de implementação com controles reais, evidências, maturidade e **gerador de planos com IA** para as normas 27001, 27002, 27017, **27701**, 31000, 37001 e 37301 — e **geração de políticas e documentos em PDF para download** (capa, sumário, 2 políticas por norma, anexo de evidências e bloco de aprovação; versão CONTROLADO com 60%+ de conformidade, RASCUNHO com marca d'água antes disso);
- 🏅 **Certificações dedicadas** — áreas próprias para **SOC 2 Type II** (Trust Services Criteria) e **PCI-DSS v4.0** (12 requisitos), cada uma com trilha de certificação e pacote documental em PDF para o auditor;
- 🤖 **Governança de IA** — área própria com ISO/IEC 42001 + EU AI Act (classificação de risco, supervisão humana, transparência) e políticas prontas em PDF;
- 🍪 **Gestão de Cookies** — área própria com inventário, CMP, banner com paridade, bloqueio prévio e prova de consentimento (ePrivacy + GDPR);
- 🤖 **Assistente de IA** — classificação de operações, recomendação de base legal, retenção, salvaguardas e risco — **heurística local, nenhum dado sai do navegador**;
- 🛡️ **Painel administrativo** — todo cliente é admin da própria organização: cria usuários com senha temporária, bloqueia, redefine senhas, exclui contas e audita eventos;
- 🔒 **Segurança** — acesso restrito a **e-mail corporativo**, senhas com hash SHA-256+salt, bloqueio anti força-bruta progressivo, expiração de sessão por inatividade, trilha de auditoria e script de hardening do servidor para download.

## Modelo de negócio e acesso

**Plano único Completo — R$ 149,00/mês — com free trial de 7 dias (sem cartão de crédito).**
Ao fim do trial, o acesso é pausado até a ativação da assinatura (dados preservados).
Todo cliente que se cadastra torna-se **administrador da própria organização** e recebe o
painel administrativo completo para:

- ➕ **Criar usuários** (operadores ou admins) com senha temporária compartilhável;
- 🔒 **Bloquear / desbloquear** contas imediatamente;
- 🗑️ **Excluir usuários** (com confirmação e trilha de auditoria);
- 🔑 **Redefinir senhas** e auditar todos os eventos de segurança.

### Acesso de demonstração

| Campo  | Valor                  |
| ------ | ---------------------- |
| E-mail | `demo@radarlgpd.app`   |
| Senha  | `demo1234`             |

> Você também pode **criar sua própria conta** na tela inicial (torna-se admin da sua organização).
> Cada organização tem dados isolados (persistência local) e todos os recursos liberados.

## Proteção do sistema (anticópia)

O Radar GRC embarca uma camada de dissuasão contra visualização, cópia e clonagem:

- 🔒 **Atalhos bloqueados** — F12, Ctrl+Shift+I/J/C (DevTools), Ctrl+U (ver fonte), Ctrl+S (salvar página), Ctrl+P (imprimir) e Ctrl+A fora de campos;
- 🖱️ **Botão direito e seleção de texto** desativados na interface (campos de formulário permanecem usáveis);
- 💧 **Marca d'água de sessão** — o e-mail do usuário logado aparece sutilmente em todas as telas, tornando qualquer captura de tela compartilhada rastreável;
- 👁️ **Detecção de DevTools** — indicador no topo muda para "MONITORANDO" e o evento vai para a trilha de auditoria;
- 🧱 **Anti-embutimento** — CSP `frame-ancestors 'none'` + frame-busting impedem rodar o sistema dentro de outro site;
- 📋 **Aviso de propriedade** no console e registro de cada tentativa bloqueada.

> **Nota técnica honesta:** nenhuma aplicação web consegue impedir 100% a leitura do código pelo navegador — esta camada **desincentiva e audita** tentativas. A proteção efetiva do código-fonte é manter o **repositório privado** e publicar apenas o build (`dist`), nunca o `src`.

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

## Publicando pela primeira vez

Se você criou o repositório pelo site do GitHub (com README/LICENÇA/.gitignore iniciais),
envie o projeto pelo próprio navegador — sem instalar nada:

1. Na página do repositório: **Add file → Upload files**;
2. Na pasta do projeto no seu computador, selecione **e envie**:
   - Pastas: `src/`, `public/`, `.github/` (pasta oculta — no Windows ative *Exibir → Itens ocultos*; no Mac `Cmd+Shift+.`)
   - Arquivos da raiz: `package.json`, `package-lock.json`, `index.html`, `tsconfig.json`, `vite.config.js`, `vercel.json`, `netlify.toml`, `.gitignore`, `LICENSE`, `README.md`
3. ⚠️ **NÃO envie** `node_modules/` nem `dist/` (são gerados automaticamente);
4. Role até o fim, escreva a mensagem do commit e clique em **Commit changes**.

> O README/LICENÇA iniciais do GitHub serão sobrescritos pelos do projeto (licença MIT).

## Hospedar direto pelo GitHub (GitHub Pages)

O repositório já vem com o workflow `.github/workflows/deploy.yml`: cada push na branch
`main`/`master` faz build com **base relativo** (`--base=./`) e publica no Pages —
funciona na raiz **e** em subpasta, sem configurar nada no código.

1. Suba o código para um repositório do GitHub;
2. No repositório: **Settings → Pages → Build and deployment → Source = “GitHub Actions”**;
3. Faça um push (ou *Actions → Deploy — GitHub Pages → Run workflow*);
4. Aguarde o workflow ficar verde e acesse:
   - **Site de usuário** (repo chamado `SEU-USUARIO.github.io`): `https://SEU-USUARIO.github.io`
   - **Site de projeto** (qualquer outro nome): `https://SEU-USUARIO.github.io/NOME-DO-REPO`

> Dica: se criar o repositório com o nome exato `SEU-USUARIO.github.io`, o site sobe na
> raiz do seu domínio GitHub — o formato mais simples de portfólio.

## Outras opções (a partir do mesmo repositório)

| Serviço | Como conectar | Observações |
|---|---|---|
| **GitHub Pages** | Automático via Actions (acima) | Grátis, direto no GitHub |
| **Netlify** | *Add new site → Import do GitHub* | Já configurado via `netlify.toml` |
| **Cloudflare Pages** | *Create project → GitHub* · build `npm run build` · output `dist` | CDN global grátis |
| **Vercel** | *Import Project → repo* | Config no `vercel.json` |

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
