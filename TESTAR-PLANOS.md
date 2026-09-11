# Como Testar o Sistema de Planos

## 🧪 Testes Recomendados

### 1. Testar Conta Demo
1. Faça login com `demo@radarlgpd.app` / `demo1234`
2. Verifique que apenas o dashboard está acessível
3. Tente acessar outras funcionalidades (ISO, IA, etc.)
4. Verifique que aparece a tela "Funcionalidade Bloqueada"
5. Clique em "Ver Planos" e verifique que redireciona para a página de planos

### 2. Testar Trial
1. Crie uma nova conta com e-mail corporativo
2. Verifique que tem 7 dias de trial
3. Acesse todas as funcionalidades
4. Após 7 dias (ou simulando expiração), verifique que aparece a tela TrialGate
5. Escolha um plano e verifique que as funcionalidades são liberadas

### 3. Testar Planos Pagos
1. Faça login com uma conta que tem plano Standard
2. Verifique que tem acesso a:
   - ✅ Dashboard
   - ✅ LGPD (registro, risco, titulares, bases)
   - ✅ GDPR (ROPA, avançado)
   - ❌ ISO (bloqueado)
   - ❌ IA (bloqueado)
   - ❌ Cookies (bloqueado)
3. Faça upgrade para Business
4. Verifique que agora tem acesso a:
   - ✅ ISO
   - ✅ IA
   - ❌ Cookies (ainda bloqueado)
5. Faça upgrade para Completo
6. Verifique que todas as funcionalidades estão liberadas

### 4. Testar Limites de Usuários
1. Faça login com conta Standard (limite 3 usuários)
2. Vá em Administração → Painel admin
3. Tente criar 4 usuários
4. Verifique que o 4º usuário é bloqueado
5. Faça upgrade para Business (limite 10 usuários)
6. Verifique que agora pode criar mais usuários

### 5. Testar Links dos Planos
1. Vá para a página de planos
2. Clique nos links dos planos
3. Verifique que redirecionam para:
   - https://radargrc.com/planos/standard
   - https://radargrc.com/planos/business
   - https://radargrc.com/planos/completo

## 🔍 Verificações Técnicas

### Verificar se as permissões estão funcionando
1. Abra o console do navegador (F12)
2. Faça login com diferentes planos
3. Verifique que o hook `usePermissoes` está retornando os valores corretos
4. Verifique que as rotas estão sendo bloqueadas corretamente

### Verificar se o TrialGate está funcionando
1. Faça login com conta em trial
2. Simule expiração do trial (modifique a data no localStorage)
3. Verifique que aparece a tela TrialGate
4. Escolha um plano e verifique que é ativado

### Verificar se as limitações estão funcionando
1. Faça login com conta Standard
2. Tente acessar funcionalidades bloqueadas
3. Verifique que aparece a tela LockedFeature
4. Verifique que o botão "Ver Planos" funciona

## 📊 Checklist de Testes

- [ ] Conta demo tem acesso apenas ao dashboard
- [ ] Conta demo vê tela de bloqueio em outras funcionalidades
- [ ] Trial tem 7 dias de acesso completo
- [ ] TrialGate aparece quando trial expira
- [ ] Plano Standard tem acesso limitado
- [ ] Plano Business tem mais funcionalidades
- [ ] Plano Completo tem todas as funcionalidades
- [ ] Limites de usuários funcionam
- [ ] Links dos planos funcionam
- [ ] Tela LockedFeature aparece corretamente
- [ ] Botão "Ver Planos" funciona
- [ ] Upgrade de plano funciona
- [ ] Permissões são verificadas em todas as rotas

## 🐛 Problemas Comuns

### Problema: Funcionalidades não estão sendo bloqueadas
**Solução**: Verifique se o hook `usePermissoes` está sendo usado corretamente nas rotas

### Problema: TrialGate não aparece
**Solução**: Verifique se a data do trial está sendo verificada corretamente

### Problema: Links dos planos não funcionam
**Solução**: Atualize os URLs em `src/components/Plans.tsx` com os links reais

### Problema: Limites de usuários não funcionam
**Solução**: Verifique se a função `verificarLimiteUsuarios` está sendo chamada corretamente

## 📝 Notas

- O sistema de planos está totalmente funcional
- As limitações são aplicadas em todas as rotas
- A conta demo tem acesso limitado
- Os links dos planos precisam ser atualizados
- O sistema está pronto para integração com gateway de pagamento
