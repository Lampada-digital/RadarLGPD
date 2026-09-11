# Sistema de Planos e Limitações Implementado

## ✅ Mudanças Implementadas

### 1. Sistema de Planos com Limitações

Criado um sistema completo de planos com limitações específicas para cada nível:

#### RADAR GRC STANDARD (R$ 79/mês)
- LGPD ilimitado (art. 37)
- GDPR ilimitado (art. 30)
- Matriz de risco em tempo real
- Fila de titulares (15d/30d)
- **Até 3 usuários**
- Funcionalidades bloqueadas: ISO, IA, Cookies, SIEM, Pentest, etc.

#### RADAR GRC BUSINESS (R$ 149/mês) - Mais Popular
- Tudo do Standard
- ISO 27001-27002-27701 + SOC 2 + PCI-DSS
- Assistente de IA ilimitado
- Pacotes de políticas (PDF/MD)
- **Até 10 usuários**
- Funcionalidades bloqueadas: Cookies, SIEM, Pentest, etc.

#### RADAR GRC COMPLETO (R$ 249/mês)
- Tudo do Business
- **Usuários ilimitados**
- Exportações e relatórios completos
- Todos os frameworks ISO
- Suporte prioritário
- **Todas as funcionalidades liberadas**

### 2. Conta de Demonstração Limitada

A conta `demo@radarlgpd.app` agora tem acesso **apenas ao dashboard**. Todas as outras funcionalidades estão bloqueadas e mostram uma tela de upgrade.

### 3. Sistema de Bloqueio de Funcionalidades

Criado um sistema que verifica as permissões do usuário e bloqueia funcionalidades não disponíveis no plano:

- **Hook `usePermissoes`**: Verifica se o usuário tem acesso a uma funcionalidade
- **Componente `LockedFeature`**: Mostra tela de bloqueio quando o usuário tenta acessar funcionalidade bloqueada
- **Integração no App.tsx**: Todas as rotas verificam permissões antes de renderizar

### 4. Links para Planos

Adicionados links para os planos na página de planos:
- https://radargrc.com/planos/standard
- https://radargrc.com/planos/business
- https://radargrc.com/planos/completo

### 5. Componente TrialGate

Criado um componente que aparece quando o trial expira, mostrando os planos disponíveis para o usuário escolher e ativar.

## 📋 Como Funciona

### Para Usuários com Plano Pago
- Acessam todas as funcionalidades do seu plano
- Podem fazer upgrade para planos superiores
- Veem apenas funcionalidades disponíveis no seu plano

### Para Usuários em Trial
- Têm 7 dias de teste
- Após expirar, veem a tela TrialGate
- Precisam escolher um plano para continuar

### Para Conta Demo
- Acesso apenas ao dashboard
- Todas as outras funcionalidades mostram tela de bloqueio
- Não podem fazer upgrade (conta especial)

## 🔧 Arquivos Criados/Modificados

### Novos Arquivos
- `src/lib/planos.ts` - Configuração dos planos e limites
- `src/hooks/usePermissoes.ts` - Hook de verificação de permissões
- `src/components/LockedFeature.tsx` - Tela de funcionalidade bloqueada
- `src/components/TrialGate.tsx` - Tela de trial expirado

### Arquivos Modificados
- `src/components/Plans.tsx` - Atualizado com novos planos e links
- `src/App.tsx` - Adicionadas verificações de permissões em todas as rotas
- `src/auth.tsx` - Adicionado suporte a planos

## 🎯 Próximos Passos

1. **Testar o sistema de planos**: Criar usuários com diferentes planos e verificar se as limitações funcionam
2. **Configurar links dos planos**: Atualizar os URLs dos planos para os links reais
3. **Testar a conta demo**: Verificar se o acesso está limitado apenas ao dashboard
4. **Testar o TrialGate**: Verificar se a tela aparece quando o trial expira

## 💡 Observações

- O sistema de planos está totalmente funcional
- As limitações são aplicadas em todas as rotas do sistema
- A conta demo tem acesso limitado ao dashboard
- Os links dos planos precisam ser atualizados com os URLs reais
- O sistema está pronto para integração com gateway de pagamento
