#!/bin/bash

# Script de Diagnóstico Completo - Radar GRC
# Este script identifica e corrige automaticamente os problemas mais comuns

echo "🔍 Diagnóstico Completo do Projeto Radar GRC"
echo "=============================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função de erro
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Função de sucesso
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Função de aviso
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Verificar se está em um repositório git
echo "📋 Verificando repositório Git..."
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    error "Este diretório não é um repositório git"
    echo ""
    warning "Inicializando repositório git..."
    git init
    success "Repositório git inicializado"
    echo ""
else
    success "Repositório git encontrado"
fi

# Verificar configuração do git
echo ""
echo "👤 Verificando configuração do Git..."
GIT_USER=$(git config user.name)
GIT_EMAIL=$(git config user.email)

if [ -z "$GIT_USER" ]; then
    warning "Nome do usuário não configurado"
    read -p "Digite seu nome completo: " GIT_USER
    git config user.name "$GIT_USER"
fi

if [ -z "$GIT_EMAIL" ]; then
    warning "Email não configurado"
    read -p "Digite seu email do GitHub: " GIT_EMAIL
    git config user.email "$GIT_EMAIL"
fi

success "Configuração do Git:"
echo "   Nome: $GIT_USER"
echo "   Email: $GIT_EMAIL"

# Verificar remote
echo ""
echo "🔗 Verificando remote..."
REMOTE_URL=$(git remote get-url origin 2>/dev/null)

if [ -z "$REMOTE_URL" ]; then
    warning "Remote não configurado"
    echo ""
    echo "📝 Para configurar o remote:"
    echo "1. Crie um repositório no GitHub: https://github.com/new"
    echo "2. Copie a URL do repositório"
    echo "3. Cole aqui:"
    read -p "URL do repositório: " REPO_URL
    
    if [ ! -z "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
        success "Remote configurado: $REPO_URL"
    else
        error "URL não fornecida. Abortando."
        exit 1
    fi
else
    success "Remote configurado: $REMOTE_URL"
fi

# Verificar arquivos
echo ""
echo "📦 Verificando arquivos..."
if git diff --quiet && git diff --staged --quiet; then
    warning "Nenhum arquivo para commit"
    echo ""
    warning "Adicionando todos os arquivos..."
    git add .
    success "Arquivos adicionados"
else
    success "Arquivos encontrados"
fi

# Fazer commit
echo ""
echo "📝 Fazendo commit..."
if git commit -m "Initial commit - Radar GRC" 2>/dev/null; then
    success "Commit realizado"
else
    warning "Commit já existe ou não há mudanças"
fi

# Verificar branch
echo ""
echo "🌿 Verificando branch..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    warning "Branch atual: $CURRENT_BRANCH"
    warning "Renomeando para main..."
    git branch -M main
    success "Branch renomeada para main"
else
    success "Branch: main"
fi

# Tentar push
echo ""
echo "🚀 Tentando fazer push para o GitHub..."
echo ""

if git push -u origin main 2>&1; then
    echo ""
    success "✅ Push realizado com sucesso!"
    echo ""
    echo "🎉 Seu projeto está no GitHub!"
    echo "📱 Acesse: $REMOTE_URL"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Acesse seu repositório no GitHub"
    echo "2. Conecte com Vercel: https://vercel.com/new"
    echo "3. Importe o repositório"
    echo "4. Faça deploy automático"
    echo ""
else
    echo ""
    error "❌ Erro ao fazer push"
    echo ""
    echo "🔧 Possíveis soluções:"
    echo ""
    echo "1️⃣  Se pedir autenticação:"
    echo "   - Use um Personal Access Token"
    echo "   - Acesse: https://github.com/settings/tokens"
    echo "   - Clique em 'Generate new token (classic)'"
    echo "   - Marque: ✅ repo (todos os itens)"
    echo "   - Copie o token e use como senha"
    echo ""
    echo "2️⃣  Se o repositório não existir:"
    echo "   - Crie o repositório no GitHub primeiro"
    echo "   - Depois configure o remote"
    echo ""
    echo "3️⃣  Se houver conflitos:"
    echo "   - Execute: git pull origin main --allow-unrelated-histories"
    echo "   - Resolva os conflitos"
    echo "   - Depois faça push novamente"
    echo ""
    echo "4️⃣  Se for erro de permissão:"
    echo "   - Verifique se você tem acesso ao repositório"
    echo "   - Verifique se está logado na conta correta"
    echo ""
    
    # Tentar forçar push
    echo ""
    read -p "Deseja tentar forçar o push? (s/n): " FORCAR
    if [ "$FORCAR" = "s" ] || [ "$FORCAR" = "S" ]; then
        echo ""
        warning "Tentando forçar push..."
        if git push -f origin main 2>&1; then
            echo ""
            success "✅ Push forçado com sucesso!"
            echo ""
            echo "🎉 Seu projeto está no GitHub!"
            echo "📱 Acesse: $REMOTE_URL"
        else
            error "❌ Ainda não foi possível fazer push"
            echo ""
            echo "📞 Por favor, me envie a mensagem de erro exata"
            echo "   para que eu possa te ajudar a resolver."
        fi
    fi
fi

echo ""
echo "=============================================="
echo "📋 Diagnóstico concluído!"
echo "=============================================="
