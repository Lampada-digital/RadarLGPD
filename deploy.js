#!/usr/bin/env node

/**
 * Script de Deploy Automático - Radar GRC
 * Este script faz push automático para GitHub e deploy na Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function ask(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
}

async function main() {
  log('\n🚀 Deploy Automático - Radar GRC\n', 'blue');
  log('Este script irá:\n', 'yellow');
  log('1. Criar repositório no GitHub', 'yellow');
  log('2. Fazer push de todos os arquivos', 'yellow');
  log('3. Conectar com Vercel para deploy', 'yellow');
  log('\n');

  // Verificar se está em um diretório git
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
  } catch (error) {
    log('❌ Este diretório não é um repositório git', 'red');
    log('Execute: git init', 'yellow');
    process.exit(1);
  }

  // Perguntar credenciais
  log('\n📋 Informações necessárias:\n', 'blue');
  
  const githubToken = await ask('🔑 Token do GitHub (https://github.com/settings/tokens): ');
  const githubUsername = await ask('👤 Seu usuário do GitHub: ');
  const repoName = await ask('📦 Nome do repositório (padrão: radar-grc): ') || 'radar-grc';
  
  const useVercel = await ask('\n🔗 Deseja fazer deploy na Vercel? (s/n): ');
  let vercelToken = '';
  if (useVercel.toLowerCase() === 's') {
    vercelToken = await ask('🔑 Token da Vercel (https://vercel.com/account/tokens): ');
  }

  log('\n⚙️  Configurando repositório...\n', 'blue');

  try {
    // Configurar git
    execSync('git add .');
    execSync('git commit -m "Initial commit - Radar GRC" --allow-empty');
    log('✅ Arquivos adicionados ao git', 'green');

    // Criar repositório no GitHub
    log('\n📦 Criando repositório no GitHub...', 'blue');
    
    const createRepoData = JSON.stringify({
      name: repoName,
      description: 'Sistema GRC White Label - LGPD, GDPR, ISO',
      private: false
    });

    const createRepoOptions = {
      hostname: 'api.github.com',
      path: '/user/repos',
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'User-Agent': 'Radar-GRC-Deploy',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(createRepoData)
      }
    };

    const createRepoPromise = new Promise((resolve, reject) => {
      const req = https.request(createRepoOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 201) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`Erro ao criar repositório: ${data}`));
          }
        });
      });
      req.on('error', reject);
      req.write(createRepoData);
      req.end();
    });

    const repo = await createRepoPromise;
    log(`✅ Repositório criado: ${repo.html_url}`, 'green');

    // Adicionar remote e fazer push
    log('\n📤 Fazendo push dos arquivos...', 'blue');
    execSync(`git remote add origin ${repo.clone_url}`);
    execSync('git branch -M main');
    execSync('git push -u origin main');
    log('✅ Push concluído com sucesso', 'green');

    // Deploy na Vercel
    if (useVercel.toLowerCase() === 's' && vercelToken) {
      log('\n🚀 Fazendo deploy na Vercel...', 'blue');
      
      // Verificar se vercel CLI está instalado
      try {
        execSync('vercel --version', { stdio: 'ignore' });
      } catch (error) {
        log('Instalando Vercel CLI...', 'yellow');
        execSync('npm install -g vercel');
      }

      // Fazer deploy
      const vercelDeploy = execSync(`vercel --token=${vercelToken} --yes`, {
        encoding: 'utf8',
        env: { ...process.env, VERCEL_ORG_ID: '', VERCEL_PROJECT_ID: '' }
      });

      log('✅ Deploy na Vercel concluído!', 'green');
      log('\n🌐 URL do seu projeto:', 'blue');
      log(vercelDeploy, 'green');
    }

    log('\n✨ Deploy concluído com sucesso!\n', 'green');
    log('📋 Próximos passos:', 'yellow');
    log(`1. Acesse: ${repo.html_url}`, 'yellow');
    if (useVercel.toLowerCase() === 's') {
      log('2. Configure o White Label no painel admin', 'yellow');
      log('3. Use as credenciais: root@radargrc.app / Root#Radar2026', 'yellow');
    }
    log('\n');

  } catch (error) {
    log(`\n❌ Erro: ${error.message}`, 'red');
    process.exit(1);
  }
}

main().catch(console.error);
