# Radar GRC - Sistema de Governança, Risco e Compliance

Sistema completo de Governança, Risco e Compliance (GRC) com foco em LGPD e GDPR, desenvolvido com React, TypeScript e Tailwind CSS.

## 🚀 Funcionalidades

### 📊 Dashboard
- Visão geral de todos os projetos e iniciativas
- Métricas de progresso e status
- Alertas e notificações
- Gráficos interativos (Pizza, Barras, Gantt)

### 📋 Gestão de Projetos
- Cadastro e gerenciamento de projetos
- Controle de status (Planejado, Em Andamento, Concluído, Atrasado, Pausado)
- Definição de marcos e próximos passos
- Gestão de riscos por projeto
- Exportação em PDF, Excel, CSV e JSON

### 🔒 LGPD & GDPR
- Mapeamento de dados pessoais
- Registro de operações (Art. 37 LGPD / Art. 30 GDPR)
- Matriz de risco 5x5
- Gestão de titulares e solicitações
- Bases legais (Art. 6 e 9 GDPR)
- DPIA e transferências internacionais

### 📚 Frameworks ISO
- ISO 27001 (Segurança da Informação)
- ISO 27002 (Controles de Segurança)
- ISO 27017 (Segurança em Nuvem)
- ISO 27701 (Privacidade)
- ISO 31000 (Gestão de Riscos)
- ISO 37001 (Antissuborno)
- ISO 37301 (Compliance)

### 🤖 IA Integrada
- Classificação automática de operações
- Análise de risco com IA
- Sugestões de controles
- Geração de documentos automatizada

### 📄 Documentos
- Geração de políticas em PDF
- Exportação de relatórios
- Templates personalizáveis
- Versionamento de documentos

### 🔐 Segurança
- Autenticação com 2 fatores
- Recuperação de senha segura
- Controle de acesso por papel
- Logs de auditoria
- Proteção contra força bruta

### 💼 Planos Comerciais
- **Standard**: R$ 190/mês
- **Business**: R$ 350/mês
- **Completo**: R$ 459/mês

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript
- **Estilização**: Tailwind CSS 4
- **Build Tool**: Vite 6
- **Gráficos**: Recharts
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Drag & Drop**: dnd-kit

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório GitHub ao Vercel
2. O Vercel detectará automaticamente as configurações
3. Deploy automático a cada push

### Render

1. Conecte seu repositório GitHub ao Render
2. Selecione **Static Site**
3. Configure:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
4. Deploy automático a cada push

Veja [DEPLOY-RENDER.md](./DEPLOY-RENDER.md) para mais detalhes.

### GitHub Pages

1. Configure o GitHub Pages para usar a branch `gh-pages`
2. Execute `npm run build`
3. Faça deploy da pasta `dist`

## 📁 Estrutura do Projeto

```
radar-grpc/
├── src/
│   ├── components/       # Componentes React
│   │   ├── charts/      # Componentes de gráficos
│   │   ├── ui/          # Componentes de UI
│   │   └── ...          # Outros componentes
│   ├── lib/             # Bibliotecas e utilitários
│   ├── auth.tsx         # Autenticação
│   ├── store.tsx        # Estado global
│   ├── domain.ts        # Domínio da aplicação
│   └── ...
├── public/              # Arquivos públicos
├── dist/                # Build de produção
├── render.yaml          # Configuração do Render
├── package.json         # Dependências
└── vite.config.ts       # Configuração do Vite
```

## 🔑 Credenciais de Demonstração

- **Email**: demo@radarlgpd.app
- **Senha**: demo1234

## 📊 Planos

### Standard - R$ 190/mês
- LGPD ilimitado (art. 37)
- GDPR ilimitado (art. 30)
- Matriz de risco em tempo real
- Fila de titulares (15d/30d)
- Até 3 usuários

### Business - R$ 350/mês
- Tudo do Standard
- ISO 27001-27002-27701 + SOC 2 + PCI-DSS
- Assistente de IA ilimitado
- Pacotes de políticas (PDF/MD)
- Até 10 usuários

### Completo - R$ 459/mês
- Tudo do Business
- Usuários ilimitados
- Exportações e relatórios completos
- Todos os frameworks ISO
- Suporte prioritário

## 🔒 Segurança

- Autenticação com 2 fatores
- Recuperação de senha com código de 6 dígitos
- Hash de senha com SHA-256 + salt
- Controle de acesso por papel (Admin, Operador)
- Logs de auditoria completos
- Proteção contra força bruta
- Validação de e-mail corporativo

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Gera build de produção

# Preview
npm run preview      # Preview do build de produção

# Type Check
npm run typecheck    # Verifica tipos TypeScript
```

## 🌐 Links de Pagamento

- **Standard**: https://mpago.la/15FRXbU
- **Business**: https://mpago.la/1yUEzfz
- **Completo**: https://mpago.la/1MDpTpD

## 📚 Documentação

- [DEPLOY-RENDER.md](./DEPLOY-RENDER.md) - Instruções de deploy no Render
- [RECUPERACAO-SENHA.md](./RECUPERACAO-SENHA.md) - Sistema de recuperação de senha
- [ATUALIZACAO-PLANOS.md](./ATUALIZACAO-PLANOS.md) - Atualização de planos
- [GRAFICOS-STATUS-REPORT.md](./GRAFICOS-STATUS-REPORT.md) - Gráficos do Status Report

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, envie um email para suporte@radargrc.com ou abra uma issue no GitHub.

## 🎯 Próximos Passos

- [ ] Implementar backend com Supabase
- [ ] Adicionar autenticação real com 2FA
- [ ] Implementar envio de emails para recuperação de senha
- [ ] Adicionar mais frameworks ISO
- [ ] Implementar geração de documentos avançada
- [ ] Adicionar integração com APIs externas
- [ ] Implementar testes automatizados
- [ ] Adicionar PWA support

## 📈 Roadmap

- Q1 2024: Backend com Supabase
- Q2 2024: Autenticação real e 2FA
- Q3 2024: Mais frameworks ISO
- Q4 2024: Integrações com APIs externas

---

Desenvolvido com ❤️ por Radar GRC
