#!/bin/bash

# Script de Diagnóstico e Correção - Radar GRC
# Este script verifica e corrige problemas de publicação no GitHub

echo "🔍 Diagnóstico do Projeto Radar GRC"
echo "===================================="
echo ""

# Verificar se está em um repositório git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Este diretório não é um repositório git"
    echo ""
    echo "🔧 Inicializando repositório git..."
    git init
    echo "✅ Repositório git inicializado"
    echo ""
fi

# Verificar se há arquivos para commit
if git diff --quiet && git diff --staged --quiet; then
    echo "⚠️  Nenhum arquivo para commit"
    echo ""
    echo "🔧 Adicionando todos os arquivos..."
    git add .
    echo "✅ Arquivos adicionados"
    echo ""
fi

# Verificar configuração do git
echo "📋 Verificando configuração do git..."
GIT_USER=$(git config user.name)
GIT_EMAIL=$(git config user.email)

if [ -z "$GIT_USER" ]; then
    echo "❌ Nome do usuário não configurado"
    read -p "Digite seu nome: " GIT_USER
    git config user.name "$GIT_USER"
fi

if [ -z "$GIT_EMAIL" ]; then
    echo "❌ Email não configurado"
    read -p "Digite seu email: " GIT_EMAIL
    git config user.email "$GIT_EMAIL"
fi

echo "✅ Configuração do git:"
echo "   Nome: $GIT_USER"
echo "   Email: $GIT_EMAIL"
echo ""

# Verificar remote
echo "🔗 Verificando remote..."
REMOTE_URL=$(git remote get-url origin 2>/dev/null)

if [ -z "$REMOTE_URL" ]; then
    echo "❌ Remote não configurado"
    echo ""
    echo "📝 Para configurar o remote, você precisa:"
    echo "1. Criar um repositório no GitHub (https://github.com/new)"
    echo "2. Copiar a URL do repositório"
    echo "3. Executar: git remote add origin URL_DO_REPOSITORIO"
    echo ""
    read -p "Digite a URL do repositório GitHub: " REPO_URL
    if [ ! -z "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
        echo "✅ Remote configurado: $REPO_URL"
    fi
else
    echo "✅ Remote configurado: $REMOTE_URL"
fi
echo ""

# Fazer commit
echo "📝 Fazendo commit..."
git add .
git commit -m "Initial commit - Radar GRC" 2>/dev/null || echo "⚠️  Commit já existe ou não há mudanças"
echo ""

# Verificar branch
echo "🌿 Verificando branch..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "🔧 Renomeando branch para main..."
    git branch -M main
    echo "✅ Branch renomeada para main"
fi
echo ""

# Tentar push
echo "🚀 Tentando fazer push..."
if git push -u origin main 2>&1; then
    echo ""
    echo "✅ Push realizado com sucesso!"
    echo ""
    echo "🎉 Seu projeto está no GitHub!"
    echo "📱 Acesse: $REMOTE_URL"
else
    echo ""
    echo "❌ Erro ao fazer push"
    echo ""
    echo "🔧 Possíveis soluções:"
    echo ""
    echo "1. Se pedir autenticação:"
    echo "   - Use um Personal Access Token"
    echo "   - Acesse: https://github.com/settings/tokens"
    echo "   - Crie um token com permissão 'repo'"
    echo "   - Use o token como senha"
    echo ""
    echo "2. Se o repositório não existir:"
    echo "   - Crie o repositório no GitHub primeiro"
    echo "   - Depois configure o remote"
    echo ""
    echo "3. Se houver conflitos:"
    echo "   - Execute: git pull origin main"
    echo "   - Resolva os conflitos"
    echo "   - Depois faça push novamente"
    echo ""
fi

echo ""
echo "📋 Próximos passos:"
echo "1. Acesse seu repositório no GitHub"
echo "2. Conecte com Vercel (https://vercel.com/new)"
echo "3. Importe o repositório"
echo "4. Faça deploy automático"
echo ""
