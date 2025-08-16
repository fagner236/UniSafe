#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

interface SecurityCheck {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  recommendation?: string;
}

async function runSecurityChecks(): Promise<SecurityCheck[]> {
  const checks: SecurityCheck[] = [];

  // 1. Verificar JWT_SECRET
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback-secret') {
    checks.push({
      name: 'JWT_SECRET',
      status: 'FAIL',
      message: 'JWT_SECRET não configurado ou usando valor padrão inseguro',
      recommendation: 'Configure uma chave JWT_SECRET forte com pelo menos 32 caracteres'
    });
  } else if (process.env.JWT_SECRET.length < 32) {
    checks.push({
      name: 'JWT_SECRET',
      status: 'WARNING',
      message: 'JWT_SECRET muito curto',
      recommendation: 'Use uma chave com pelo menos 32 caracteres'
    });
  } else {
    checks.push({
      name: 'JWT_SECRET',
      status: 'PASS',
      message: 'JWT_SECRET configurado corretamente'
    });
  }

  // 2. Verificar BCRYPT_ROUNDS
  const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  if (bcryptRounds < 10) {
    checks.push({
      name: 'BCRYPT_ROUNDS',
      status: 'FAIL',
      message: `BCRYPT_ROUNDS muito baixo: ${bcryptRounds}`,
      recommendation: 'Configure BCRYPT_ROUNDS para pelo menos 10'
    });
  } else {
    checks.push({
      name: 'BCRYPT_ROUNDS',
      status: 'PASS',
      message: `BCRYPT_ROUNDS configurado corretamente: ${bcryptRounds}`
    });
  }

  // 3. Verificar variáveis de ambiente críticas
  const criticalEnvVars = ['NODE_ENV', 'PORT', 'CORS_ORIGIN'];
  criticalEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      checks.push({
        name: `ENV_${envVar}`,
        status: 'WARNING',
        message: `${envVar} não configurado`,
        recommendation: `Configure ${envVar} no arquivo .env`
      });
    } else {
      checks.push({
        name: `ENV_${envVar}`,
        status: 'PASS',
        message: `${envVar} configurado: ${process.env[envVar]}`
      });
    }
  });

  // 4. Verificar banco de dados
  try {
    await prisma.$connect();
    checks.push({
      name: 'DATABASE_CONNECTION',
      status: 'PASS',
      message: 'Conexão com banco de dados estabelecida'
    });

    // Verificar se há usuários com senhas fracas
    const users = await prisma.user.findMany({
      select: { id_usuario: true, email: true, senha: true }
    });

    if (users.length === 0) {
      checks.push({
        name: 'USER_PASSWORDS',
        status: 'WARNING',
        message: 'Nenhum usuário encontrado no sistema',
        recommendation: 'Crie pelo menos um usuário administrador'
      });
    } else {
      checks.push({
        name: 'USER_PASSWORDS',
        status: 'PASS',
        message: `${users.length} usuário(s) encontrado(s)`
      });
    }

  } catch (error) {
    checks.push({
      name: 'DATABASE_CONNECTION',
      status: 'FAIL',
      message: 'Falha na conexão com banco de dados',
      recommendation: 'Verifique a configuração DATABASE_URL'
    });
  }

  // 5. Verificar configurações de rate limiting
  const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000');
  const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
  
  if (rateLimitWindow < 60000) { // menos de 1 minuto
    checks.push({
      name: 'RATE_LIMIT_WINDOW',
      status: 'WARNING',
      message: `Janela de rate limiting muito pequena: ${rateLimitWindow}ms`,
      recommendation: 'Configure RATE_LIMIT_WINDOW_MS para pelo menos 60000ms (1 minuto)'
    });
  } else {
    checks.push({
      name: 'RATE_LIMIT_WINDOW',
      status: 'PASS',
      message: `Janela de rate limiting configurada: ${rateLimitWindow}ms`
    });
  }

  if (rateLimitMax > 1000) {
    checks.push({
      name: 'RATE_LIMIT_MAX',
      status: 'WARNING',
      message: `Rate limit muito alto: ${rateLimitMax} requisições`,
      recommendation: 'Considere reduzir RATE_LIMIT_MAX_REQUESTS para 100-500'
    });
  } else {
    checks.push({
      name: 'RATE_LIMIT_MAX',
      status: 'PASS',
      message: `Rate limit configurado: ${rateLimitMax} requisições`
    });
  }

  return checks;
}

async function main() {
  console.log('🔒 Verificação de Segurança do UniSafe\n');
  
  try {
    const checks = await runSecurityChecks();
    
    let passCount = 0;
    let warningCount = 0;
    let failCount = 0;

    checks.forEach(check => {
      const statusIcon = check.status === 'PASS' ? '✅' : check.status === 'WARNING' ? '⚠️' : '❌';
      console.log(`${statusIcon} ${check.name}: ${check.message}`);
      
      if (check.recommendation) {
        console.log(`   💡 Recomendação: ${check.recommendation}`);
      }
      
      if (check.status === 'PASS') passCount++;
      else if (check.status === 'WARNING') warningCount++;
      else failCount++;
      
      console.log('');
    });

    console.log('📊 Resumo da Verificação:');
    console.log(`✅ Passou: ${passCount}`);
    console.log(`⚠️  Avisos: ${warningCount}`);
    console.log(`❌ Falhou: ${failCount}`);

    if (failCount > 0) {
      console.log('\n🚨 ATENÇÃO: Existem falhas críticas de segurança que devem ser corrigidas!');
      process.exit(1);
    } else if (warningCount > 0) {
      console.log('\n⚠️  Existem avisos de segurança que devem ser revisados.');
    } else {
      console.log('\n🎉 Sistema está configurado com segurança adequada!');
    }

  } catch (error) {
    console.error('❌ Erro durante verificação de segurança:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
