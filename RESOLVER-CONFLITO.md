# Como Resolver Conflitos de Merge no Git

## 🚨 Problema Identificado

Você está enfrentando um conflito de merge no Git entre as branches:
- `lgpd-data-management-system-with-ai-81bb6`
- `main`

## ✅ Solução: Resolver Conflito

### Opção 1: Resolver Localmente (Recomendado)

```bash
# 1. Clone o repositório (se ainda não fez)
git clone https://github.com/serberohades/radar-lgpd.git
cd radar-lgpd

# 2. Busque todas as branches
git fetch origin

# 3. Mude para a branch main
git checkout main

# 4. Faça merge com a branch com conflitos
git merge origin/lgpd-data-management-system-with-ai-81bb6

# 5. O Git mostrará os arquivos conflitantes
# Abra o README.md e procure por:
# <<<<<<< lgpd-data-management-system-with-ai-81bb6
# =======
# >>>>>>> main

# 6. Edite o arquivo e remova os marcadores de conflito
# Mantenha apenas o conteúdo desejado (geralmente o mais recente)

# 7. Adicione o arquivo resolvido
git add README.md

# 8. Faça commit
git commit -m "Resolve merge conflict in README.md"

# 9. Faça push
git push origin main
```

### Opção 2: Resolver no GitHub (Mais Fácil)

1. **Acesse o Pull Request**
   - Vá para o repositório no GitHub
   - Clique no Pull Request com conflitos

2. **Clique em "Resolve conflicts"**
   - O GitHub mostrará os arquivos conflitantes

3. **Edite o README.md**
   - Remova os marcadores de conflito:
     ```
     <<<<<<< lgpd-data-management-system-with-ai-81bb6
     [conteúdo da branch]
     =======
     [conteúdo da branch main]
     >>>>>>> main
     ```
   - Mantenha apenas o conteúdo desejado (geralmente o mais recente/completo)

4. **Marque como resolvido**
   - Clique em **"Mark as resolved"**

5. **Commit do merge**
   - Clique em **"Commit merge"**

6. **Aguarde o deploy**
   - O GitHub Actions executará automaticamente

### Opção 3: Forçar Push (CUIDADO!)

**⚠️ ATENÇÃO**: Isso sobrescreverá o histórico. Use apenas se tiver certeza.

```bash
# Faça backup primeiro
git branch backup-branch

# Force push para sobrescrever
git push origin main --force
```

## 📝 Exemplo de Resolução

### Antes (com conflito):
```markdown
<<<<<<< lgpd-data-management-system-with-ai-81bb6
# Radar GRC - Sistema de Governança, Risco e Compliance

Sistema completo de Governança, Risco e Compliance (GRC)...
=======
# Radar GRC - Sistema de Governança, Risco e Compliance

Sistema completo de Governança, Risco e Compliance (GRC)...
>>>>>>> main
```

### Depois (resolvido):
```markdown
# Radar GRC - Sistema de Governança, Risco e Compliance

Sistema completo de Governança, Risco e Compliance (GRC)...
```

## 🎯 Recomendação

**Use a Opção 2 (Resolver no GitHub)** - é a mais fácil e segura:

1. Acesse o Pull Request no GitHub
2. Clique em **"Resolve conflicts"**
3. Edite o arquivo e remova os marcadores
4. Clique em **"Mark as resolved"**
5. Clique em **"Commit merge"**
6. Aguarde o deploy automático

## 📞 Precisa de Ajuda?

Se tiver dúvidas:
- [GitHub Docs - Resolving merge conflicts](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts)
- [GitHub Docs - About merge conflicts](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/about-merge-conflicts)

---

Desenvolvido com ❤️ por Radar GRC
