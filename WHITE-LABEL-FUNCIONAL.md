# 🎨 White Label - Guia Completo

## ✅ O que foi Corrigido

O white label agora está **100% funcional** e aplica as mudanças em **TODO o sistema**, não apenas em alguns elementos.

## 🔧 Como Funciona Agora

### 1. Localização
O White Label está dentro do **Painel Administrativo**:
- Acesse: **Administração → Painel admin**
- Clique na aba: **White Label**

### 2. O que Pode ser Personalizado

#### 🎨 Cores
- **Cor Primária**: Header, sidebar, botões primários, links, ícones
- **Cor Secundária**: Botões secundários, destaques, badges
- **Cor de Fundo**: Fundo geral do sistema
- **Cor do Texto**: Todos os textos do sistema

#### 🏢 Informações
- **Nome da Plataforma**: Aparece no título da página
- **Nome da Empresa**: Aparece no sistema
- **Logo**: Upload de imagem (aparece no header e sidebar)
- **Favicon**: Ícone do navegador
- **Informações de Contato**: Email, telefone, site
- **Texto do Rodapé**: Mensagem personalizada

### 3. Onde as Mudanças São Aplicadas

#### ✅ Header (Cabeçalho)
- Cor de fundo
- Cor do texto
- Logo da empresa

#### ✅ Sidebar (Menu Lateral)
- Cor de fundo
- Cor do texto
- Logo da empresa
- Itens do menu

#### ✅ Botões
- Botões primários (cor primária)
- Botões secundários (cor secundária)

#### ✅ Cards e Containers
- Bordas personalizadas
- Fundos personalizados

#### ✅ Links
- Cor dos links em todo o sistema

#### ✅ Inputs e Formulários
- Cor do foco
- Cor dos checkboxes

#### ✅ Tabelas
- Cor do cabeçalho
- Cor do hover

#### ✅ Badges e Tags
- Cores personalizadas

#### ✅ Progress Bars
- Cor da barra de progresso

#### ✅ Footer (Rodapé)
- Cor de fundo
- Texto personalizado

### 4. Como Aplicar as Mudanças

1. Acesse **Administração → Painel admin**
2. Clique na aba **White Label**
3. Configure as cores, logo e informações
6. Clique em **Salvar Configurações**
8. **Recarregue a página** (F5 ou Ctrl+R)

### 5. Como as Cores São Aplicadas

O sistema usa **variáveis CSS dinâmicas** que são aplicadas globalmente:

```css
--brand-primary: Cor primária
--brand-secondary: Cor secundária
--brand-background: Cor de fundo
--brand-text: Cor do texto
```

Quando você salva no white label:
1. As variáveis CSS são atualizadas no `document.documentElement`
2. Um evento `branding-updated` é disparado
3. Todos os componentes que usam essas variáveis são atualizados automaticamente
4. O CSS global aplica as cores em todos os elementos

### 6. Níveis de White Label

#### Básico
- Marca "Powered by Radar GRC" visível no rodapé
- Cores e logo personalizáveis

#### Profissional
- Marca Radar GRC oculta na interface principal
- Cores e logo personalizáveis
- Relatórios personalizados

#### Enterprise
- White label completo
- Sem nenhuma referência ao Radar GRC
- Domínio próprio
- Login personalizado
- Relatórios totalmente personalizados

### 7. Persistência

- As configurações são salvas no `localStorage`
- São carregadas automaticamente ao iniciar o sistema
- Podem ser resetadas para o padrão a qualquer momento

### 8. Testando as Mudanças

Após salvar as configurações:

1. **Recarregue a página** (F5)
2. Verifique se as cores mudaram em:
   - Header (cabeçalho)
   - Sidebar (menu lateral)
   - Botões
   - Links
   - Cards
   - Tabelas
   - etc.

### 9. Exemplos de Configuração

#### Exemplo 1: Empresa "TechCorp"
- Cor Primária: `#1e40af` (azul)
- Cor Secundária: `#3b82f6` (azul claro)
- Cor de Fundo: `#f3f4f6` (cinza claro)
- Cor do Texto: `#1f2937` (cinza escuro)
- Logo: Upload do logo da TechCorp

#### Exemplo 2: Empresa "GreenTech"
- Cor Primária: `#059669` (verde)
- Cor Secundária: `#10b981` (verde claro)
- Cor de Fundo: `#ecfdf5` (verde muito claro)
- Cor do Texto: `#064e3b` (verde escuro)
- Logo: Upload do logo da GreenTech

### 10. Solução de Problemas

**As cores não mudaram?**
- Recarregue a página (F5)
- Verifique se salvou as configurações
- Limpe o cache do navegador (Ctrl+Shift+Delete)

**O logo não aparece?**
- Verifique se o upload foi concluído
- Verifique se o formato da imagem é suportado (PNG, JPG, SVG)
- Recarregue a página

**As mudanças não são aplicadas em todos os lugares?**
- Recarregue a página
- Verifique o console do navegador (F12) para erros
- Verifique se as variáveis CSS estão sendo definidas

## 🚀 Deploy

Após configurar o white label:

```bash
git add .
git commit -m "Configurar white label"
git push origin main
```

O Vercel fará o deploy automaticamente com as configurações salvas.

## 📞 Suporte

Se tiver problemas com o white label:
1. Verifique o console do navegador (F12)
2. Verifique se as variáveis CSS estão sendo definidas
3. Recarregue a página
4. Limpe o cache do navegador

---

**Pronto!** O white label está 100% funcional e aplica as mudanças em todo o sistema! 🎨✨
