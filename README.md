# Radar GRC — LGPD · GDPR · ISO com IA

Plataforma de **privacidade e compliance** que coloca todo dado pessoal da empresa sob um
mesmo radar: mapeamento LGPD e GDPR, programas de implementação das normas ISO e
certificações (SOC 2, PCI-DSS), gestão de cookies e documentos prontos para auditoria —
com classificação assistida por IA que roda 100% no navegador.

## Acesso

| Conta | E-mail | Senha |
|---|---|---|
| Demonstração (Completo) | `demo@radarlgpd.app` | `demo1234` |
| **Root / Administrador Master** | `root@radargrc.app` | `Root#Radar2026` |

> A conta **root** é administrador com plano Completo (acesso total, sem marcação de demo).
> Na tela de login, digite as credenciais manualmente (não aparece nos atalhos).

## Funcionalidades

- 🗺️ **LGPD** — Registro de operações (art. 37) com classificação por IA, matriz de risco 5×5
  que recalcula em tempo real, fila de titulares (prazo 15d) e bases legais (art. 7º/11).
- 🇪🇺 **GDPR** — ROPA (art. 30), bases Art. 6/9/10, DPIA pelos critérios EDPB (WP248) e
  transferências internacionais (Capítulo V).
- 📋 **Frameworks & certificações** — ISO 27001, 27002, 27701, **22301 (BCM)**, 31000, 37301,
  37001, SOC 2 Type II, PCI-DSS v4.0, Governança de IA (ISO 42001 / AI Act) e Cookies.
  Cada um com controles, estados, **evidências (documentos/imagens)**, plano de implementação
  com IA e **pacote de políticas em PDF** (CONTROLADO com 60%+ de conformidade).
- 🍪 **Gestão de Cookies** — gerador de banner instalável no site do cliente, consentimentos
  em tempo real, inventário classificado por IA e diagnóstico de conformidade.
- 📄 **Relatórios** — exportação JSON/CSV, impressão/PDF e estado dos frameworks.
- 🛡️ **Segurança** — senhas SHA-256+salt, bloqueio anti força-bruta, e-mail corporativo
  obrigatório, trilha de auditoria, camada anticópia e script de hardening.
- 👥 **Administração** — criar/bloquear/redefinir/excluir usuários, limites por plano.
- 💳 **Planos** — Trial 7 dias (somente leitura), Standard, Business e Completo.

## Stack

- **React + Vite + TypeScript**, Tailwind CSS v4
- Identidade própria: Bricolage Grotesque + Instrument Sans, paleta pinho/lima/papel
- Sem dependências de PDF — motor próprio de geração de documentos

## Desenvolvimento

```bash
npm install
npm run dev      # ambiente local
npm run build    # build de produção (dist/)
```

## Deploy (Vercel)

1. Suba este repositório para o GitHub;
2. Na Vercel: **Import Project** → selecione o repositório;
3. A Vercel detecta o Vite automaticamente (configuração em `vercel.json`);
4. Deploy pronto — o rewrite de SPA e os headers de segurança já estão configurados.

> **Proteção do código:** mantenha o repositório **privado** e publique apenas o build (`dist`).
> Nunca exponha publicamente a pasta `src`.
