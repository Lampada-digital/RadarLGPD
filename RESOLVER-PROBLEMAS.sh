#!/bin/bash

# Script para resolver problemas de deploy do Radar GRC
# Execute: bash RESOLVER-PROBLEMAS.sh

echo "🚀 Resolver Problemas de Deploy - Radar GRC"
echo "============================================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Este script vai te ajudar a resolver:${NC}"
echo "1. Conflitos de merge no GitHub"
echo "2. Limite de deploy da Vercel"
echo ""

# Verificar se está em um repositório git
if [ ! -d .git ]; then
    echo -e "${RED}❌ Erro: Este diretório não é um repositório Git${NC}"
    echo "Por favor, execute este script na pasta do projeto radar-lgpd"
    exit 1
fi

echo -e "${GREEN}✅ Repositório Git detectado${NC}"
echo ""

# Menu de opções
echo "O que você deseja fazer?"
echo ""
echo "1) Resolver conflito de merge no GitHub"
echo "2) Limpar projetos antigos da Vercel (manual)"
echo "3) Fazer deploy no Netlify (alternativa rápida)"
echo "4) Ver status atual do Git"
echo "5) Sair"
echo ""

read -p "Escolha uma opção (1-5): " opcao

case $opcao in
    1)
        echo ""
        echo -e "${YELLOW}📝 Resolver Conflito de Merge${NC}"
        echo "================================"
        echo ""
        echo "Instruções:"
        echo "1. Acesse: https://github.com/serberohades/radar-lgpd/pulls"
        echo "2. Clique no PR com conflito"
        echo "3. Clique em 'Resolve conflicts'"
        echo "4. Edite o README.md:"
        echo "   - Remova: <<<<<<< , ======= , >>>>>>>"
        echo "   - Mantenha apenas o conteúdo mais recente"
        echo "5. Clique em 'Mark as resolved'"
        echo "6. Clique em 'Commit merge'"
        echo ""
        echo -e "${GREEN}✅ Após resolver, o GitHub Actions executará automaticamente${NC}"
        echo ""
        read -p "Pressione Enter para continuar..."
        ;;
        
    2)
        echo ""
        echo -e "${YELLOW}🗑️  Limpar Projetos Vercel${NC}"
        echo "=========================="
        echo ""
        echo "Instruções:"
        echo "1. Acesse: https://vercel.com/dashboard"
        echo "2. Delete os projetos de preview antigos:"
        echo ""
        echo "   Projetos para deletar:"
        echo "   - radar-lgpd-2kzz"
        echo "   - radar-lgpd-3phw"
        echo "   - radar-lgpd-6m61"
        echo "   - radar-lgpd-33vo"
        echo "   - radar-lgpd-56w5"
        echo "   - radar-lgpd-85fq"
        echo "   - radar-lgpd-4315"
        echo "   - radar-lgpd-a1cw"
        echo "   - radar-lgpd-b4ko"
        echo "   - radar-lgpd-clc6"
        echo "   - radar-lgpd-egml"
        echo "   - radar-lgpd-hvrt"
        echo "   - radar-lgpd-ippa"
        echo "   - radar-lgpd-kjjv"
        echo "   - radar-lgpd-n42s"
        echo "   - radar-lgpd-o5xv"
        echo "   - radar-lgpd-oyrb"
        echo "   - radar-lgpd-uvko"
        echo "   - radar-lgpd-vzlj"
        echo "   - radar-lgpd-wkk1"
        echo "   - radar-lgpd-yicv"
        echo "   - radar-lgpd-zvr6"
        echo ""
        echo "3. Mantenha apenas: radar-lgpd (principal)"
        echo "4. Aguarde 24 horas OU contate suporte Vercel"
        echo ""
        echo -e "${GREEN}✅ Após limpar, aguarde 24h para o limite resetar${NC}"
        echo ""
        read -p "Pressione Enter para continuar..."
        ;;
        
    3)
        echo ""
        echo -e "${YELLOW}🚀 Deploy no Netlify (Alternativa Rápida)${NC}"
        echo "========================================"
        echo ""
        echo "Instruções:"
        echo "1. Acesse: https://app.netlify.com"
        echo "2. Login com GitHub"
        echo "3. Clique em 'Add new site' → 'Import an existing project'"
        echo "4. Selecione o repositório: radar-lgpd"
        echo "5. Configure:"
        echo "   - Branch: main"
        echo "   - Build command: npm run build"
        echo "   - Publish directory: dist"
        echo "6. Clique em 'Deploy site'"
        echo "7. Aguarde 2-3 minutos"
        echo "8. Site disponível em: https://radar-lgpd.netlify.app"
        echo ""
        echo -e "${GREEN}✅ Netlify oferece deploy ilimitado no plano gratuito${NC}"
        echo ""
        read -p "Pressione Enter para continuar..."
        ;;
        
    4)
        echo ""
        echo -e "${YELLOW}📊 Status Atual do Git${NC}"
        echo "======================"
        echo ""
        git status
        echo ""
        echo "Branches disponíveis:"
        git branch -a
        echo ""
        echo "Últimos commits:"
        git log --oneline -5
        echo ""
        read -p "Pressione Enter para continuar..."
        ;;
        
    5)
        echo ""
        echo -e "${GREEN}✅ Saindo...${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ Opção inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Script concluído!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Resolva o conflito no GitHub"
echo "2. Limpe os projetos antigos na Vercel"
echo "3. Aguarde 24h OU use Netlify"
echo ""
echo "Se precisar de ajuda:"
echo "- GitHub Docs: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts"
echo "- Vercel Support: https://vercel.com/support"
echo ""
