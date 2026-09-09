# Como publicar o Radar GRC no GitHub (passo a passo)

O repositório `serberohades` foi criado com **apenas 3 arquivos automáticos**
(`.gitignore`, `LICENSE`, `README.md`). O código do projeto precisa ser enviado.
Escolha **um** dos dois caminhos abaixo.

---

## Caminho A — Pelo site do GitHub (não instala nada)

1. Abra a página do seu repositório no GitHub;
2. Clique em **Add file → Upload files**;
3. Arraste **exatamente estes 13 itens** da pasta do projeto para a área de upload:

   | Item | Tipo | Obrigatório? |
   |---|---|---|
   | `src` | 📁 pasta | ✅ sim |
   | `public` | 📁 pasta | ✅ sim |
   | `.github` | 📁 pasta (oculta!) | ✅ sim (faz o deploy automático) |
   | `package.json` | arquivo | ✅ sim |
   | `package-lock.json` | arquivo | ✅ sim |
   | `index.html` | arquivo | ✅ sim |
   | `tsconfig.json` | arquivo | ✅ sim |
   | `vite.config.js` | arquivo | ✅ sim |
   | `vercel.json` | arquivo | opcional (só se for usar Vercel) |
   | `netlify.toml` | arquivo | opcional (só se for usar Netlify) |
   | `.gitignore` | arquivo (oculto) | recomendado |
   | `LICENSE` | arquivo | recomendado (substitui o vazio) |
   | `README.md` | arquivo | recomendado (substitui o automático) |

   ⚠️ **NÃO envie** as pastas `node_modules` e `dist` — elas são geradas
   automaticamente pelo GitHub e só travariam o upload.

4. **Para ver os itens ocultos** (`.github` e `.gitignore`):
   - **Windows**: Explorer → menu *Exibir* → *Mostrar* → *Itens ocultos*
   - **Mac**: no Finder, pressione `Cmd + Shift + .`
5. Role até o fim da página, escreva a mensagem (ex.: *"Código completo do Radar GRC"*)
   e clique em **Commit changes**;
6. Vá na aba **Actions** do repositório: o workflow *Deploy — GitHub Pages* deve
   rodar sozinho. Aguarde o ✅ verde;
7. Ative uma única vez: **Settings → Pages → Build and deployment → Source = “GitHub Actions”**;
8. Seu site estará em:
   - `https://serberohades.github.io` (se o repo se chamar `serberohades.github.io`)
   - `https://serberohades.github.io/NOME-DO-REPO` (qualquer outro nome)

---

## Caminho B — Pelo terminal (1 bloco de comandos)

Requisito: [Git instalado](https://git-scm.com/downloads).

Abra o terminal **dentro da pasta do projeto** e cole:

```bash
git init
git add .
git commit -m "Radar GRC — LGPD, GDPR e ISO com IA"
git branch -M main
git remote add origin https://github.com/serberohades/NOME-DO-REPO.git
git push -f origin main
```

> O `push -f` é seguro aqui: o repositório só tem os 3 arquivos automáticos, que
> serão substituídos pelas versões completas do projeto.
>
> Quando o GitHub pedir senha, use um **Personal Access Token**:
> *GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
> → Generate new token → marque `repo`*.

Depois, siga os passos 6 a 8 do Caminho A (aba Actions + ativar Pages).

---

## Como saber se deu certo

No repositório, a lista de arquivos deve mostrar `src/`, `public/`, `.github/`,
`package.json`, `index.html`, entre outros. Na aba **Actions**, o workflow deve
aparecer com ✅. Na aba **Pages** (Settings), a URL do site fica visível.

A partir daí, **todo push atualiza o site sozinho**.
