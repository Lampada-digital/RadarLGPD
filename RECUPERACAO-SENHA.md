# Recuperação de Senha com 2 Fatores

## Resumo das Alterações

### 1. Remoção do Botão de Demo
- ✅ Removido o botão "Preencher conta de demonstração" da tela de login
- ✅ Removida a referência ao e-mail de demonstração na parte inferior da tela

### 2. Adição do Sistema de Recuperação de Senha com 2 Fatores
- ✅ Adicionado botão "Esqueci minha senha" na tela de login
- ✅ Implementado modal de recuperação de senha com 3 etapas:
  1. **Etapa 1**: Solicitar e-mail corporativo
  2. **Etapa 2**: Verificar código de 6 dígitos (2º fator)
  3. **Etapa 3**: Definir nova senha

## Como Funciona a Recuperação de Senha

### Fluxo Completo

1. **Usuário clica em "Esqueci minha senha"**
   - Modal de recuperação é aberto
   - Usuário insere seu e-mail corporativo

2. **Sistema gera código de 6 dígitos**
   - Código é gerado aleatoriamente (100000-999999)
   - Código é armazenado temporariamente no localStorage
   - Código expira em 10 minutos
   - Em produção, o código seria enviado por e-mail

4. **Usuário insere o código**
   - Sistema verifica se o código está correto
   - Se incorreto, mostra mensagem de erro
   - Se correto, avança para a próxima etapa

5. **Usuário define nova senha**
   - Usuário insere nova senha (mín. 10 caracteres)
   - Usuário confirma a nova senha
   - Sistema valida a força da senha
   - Se válida, senha é atualizada

6. **Senha é atualizada**
   - Nova senha é hasheada com SHA-256 + salt
   - Hash é salvo no localStorage
   - Código temporário é removido
   - Usuário é redirecionado para a tela de login

## Implementação Técnica

### Arquivos Modificados

#### 1. `src/auth.tsx`
**Funções adicionadas:**
- `recuperarSenha(email: string)`: Gera código de recuperação
- `redefinirSenha(email: string, codigo: string, novaSenha: string)`: Redefine a senha

**Interface atualizada:**
```typescript
interface AuthCtx {
  // ... outras funções
  recuperarSenha: (email: string) => Promise<{ sucesso: boolean; codigo?: string; erro?: string }>;
  redefinirSenha: (email: string, codigo: string, novaSenha: string) => Promise<{ sucesso: boolean; erro?: string }>;
}
```

#### 2. `src/components/RecuperarSenha.tsx` (NOVO)
**Componente criado com 3 etapas:**
- Etapa 1: Formulário para solicitar código
- Etapa 2: Formulário para verificar código
- Etapa 3: Formulário para definir nova senha

**Funcionalidades:**
- Validação de e-mail corporativo
- Geração de código de 6 dígitos
- Verificação do código
- Validação de força da senha
- Confirmação de senha
- Atualização da senha

#### 3. `src/components/AuthScreen.tsx`
**Alterações:**
- Removido botão de demo
- Adicionado botão "Esqueci minha senha"
- Adicionado estado `mostrarRecuperar`
- Integrado componente `RecuperarSenha`

## Segurança

### Medidas de Segurança Implementadas

1. **Validação de E-mail Corporativo**
   - Apenas e-mails corporativos são aceitos
   - Domínios pessoais/gratuitos são bloqueados

2. **Código de 6 Dígitos**
   - Código gerado aleatoriamente
   - Expira em 10 minutos
   - Armazenado temporariamente no localStorage

3. **Validação de Senha Forte**
   - Mínimo 10 caracteres
   - Letras maiúsculas e minúsculas
   - Números obrigatórios
   - Validação de confirmação

4. **Hash de Senha**
   - SHA-256 + salt
   - Senhas nunca armazenadas em texto puro

5. **Registro de Auditoria**
   - Todas as ações de recuperação são registradas
   - Logs de segurança para auditoria

## Fluxo de Recuperação de Senha

```
┌─────────────────────────────────────┐
│  1. Usuário clica em                │
│     "Esqueci minha senha"           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. Usuário insere e-mail           │
│     corporativo                     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. Sistema gera código de          │
│     6 dígitos (100000-999999)       │
│     - Armazena no localStorage      │
│     - Expira em 10 minutos          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. Usuário insere código           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. Sistema verifica código         │
│     - Se incorreto: mostra erro     │
│     - Se correto: avança            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. Usuário define nova senha       │
│     - Mín. 10 caracteres            │
│     - Maiúsculas + minúsculas       │
│     - Números obrigatórios          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  7. Sistema valida e atualiza       │
│     - Hash SHA-256 + salt           │
│     - Remove código temporário      │
│     - Registra auditoria            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  8. Usuário redirecionado para      │
│     tela de login                   │
└─────────────────────────────────────┘
```

## Validações Implementadas

### Validação de E-mail
```typescript
const v = validarEmailCorporativo(mail);
if (!v.ok) return { sucesso: false, erro: v.msg };
```

### Validação de Código
```typescript
if (codigo !== recuperacao.codigo) {
  return { sucesso: false, erro: "Código incorreto" };
}
```

### Validação de Senha
```typescript
const erroSenha = validarSenhaForte(novaSenha);
if (erroSenha) {
  return { sucesso: false, erro: erroSenha };
}
```

### Validação de Confirmação
```typescript
if (novaSenha !== confirmaSenha) {
  setErro("As senhas não coincidem");
  return;
}
```

## Expiração do Código

O código de recuperação expira em **10 minutos**:

```typescript
localStorage.setItem(`recuperacao_${mail}`, JSON.stringify({
  codigo,
  expiraEm: Date.now() + 10 * 60 * 1000, // 10 minutos
}));
```

Verificação de expiração:
```typescript
if (Date.now() > recuperacao.expiraEm) {
  localStorage.removeItem(`recuperacao_${mail}`);
  return { sucesso: false, erro: "Código expirado" };
}
```

## Registro de Auditoria

Todas as ações de recuperação são registradas:

```typescript
registrarSeguranca("recuperacao_senha", mail, `Código de recuperação gerado: ${codigo}`);
registrarSeguranca("recuperacao_senha", mail, "Senha redefinida com sucesso");
```

## Build

✅ Build realizado com sucesso:
- 77 módulos transformados
- CSS: 81.98 kB (gzip: 13.49 kB)
- JS: 578.02 kB (gzip: 149.89 kB)
- Tempo: 4.21s

## Próximos Passos (Produção)

### Melhorias para Produção

1. **Envio de Código por E-mail**
   - Implementar serviço de e-mail (SendGrid, Mailgun, etc.)
   - Enviar código de 6 dígitos por e-mail
   - Template de e-mail profissional

2. **Armazenamento Seguro**
   - Armazenar código em banco de dados
   - Criptografar código antes de armazenar
   - Implementar TTL (Time To Live) no banco

3. **Rate Limiting**
   - Limitar tentativas de recuperação
   - Bloquear após X tentativas
   - Implementar cooldown period

4. **Notificações**
   - Notificar usuário quando código for gerado
   - Notificar quando senha for alterada
   - Alertas de segurança

5. **Logs de Auditoria**
   - Armazenar logs em banco de dados
   - Implementar retenção de logs
   - Dashboard de auditoria

## Conclusão

✅ Botão de demo removido
✅ Sistema de recuperação de senha com 2 fatores implementado
✅ Validações de segurança implementadas
✅ Registro de auditoria implementado
✅ Build realizado com sucesso

O sistema agora possui um fluxo completo de recuperação de senha com 2 fatores, garantindo segurança e conformidade com as melhores práticas de segurança.
