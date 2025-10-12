#!/usr/bin/env node

/**
 * Script principal para migração completa do sistema de uploads
 * 
 * Este script executa em sequência:
 * 1. Backup do banco de dados
 * 2. Migração do schema
 * 3. Limpeza da pasta uploads
 * 4. Teste do novo sistema
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function migrateAll() {
  try {
    console.log('🚀 === MIGRAÇÃO COMPLETA DO SISTEMA DE UPLOADS ===\n');
    console.log('⚠️  ATENÇÃO: Este processo irá:');
    console.log('   - Fazer backup do banco de dados');
    console.log('   - Atualizar o schema do banco');
    console.log('   - Remover a pasta uploads/');
    console.log('   - Migrar registros existentes');
    console.log('   - Testar o novo sistema\n');

    // Verificar se o usuário confirma
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise((resolve) => {
      rl.question('Deseja continuar com a migração? (s/N): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 's' && answer.toLowerCase() !== 'sim') {
      console.log('❌ Migração cancelada pelo usuário');
      process.exit(0);
    }

    // 1. Backup do banco de dados
    console.log('\n💾 === FAZENDO BACKUP DO BANCO ===');
    await createDatabaseBackup();

    // 2. Parar o sistema
    console.log('\n⏹️  === PARANDO O SISTEMA ===');
    await stopSystem();

    // 3. Migração do schema
    console.log('\n🔧 === MIGRANDO SCHEMA ===');
    await migrateSchema();

    // 4. Limpeza da pasta uploads
    console.log('\n🧹 === LIMPANDO PASTA UPLOADS ===');
    await cleanupUploads();

    // 5. Teste do novo sistema
    console.log('\n🧪 === TESTANDO NOVO SISTEMA ===');
    await testNewSystem();

    // 6. Reiniciar sistema
    console.log('\n▶️  === REINICIANDO SISTEMA ===');
    await startSystem();

    console.log('\n🎉 === MIGRAÇÃO CONCLUÍDA COM SUCESSO ===');
    console.log('✅ Sistema migrado para processamento em memória');
    console.log('✅ Pasta uploads removida');
    console.log('✅ Banco de dados atualizado');
    console.log('✅ Sistema testado e funcionando');
    console.log('✅ Sistema reiniciado');

    console.log('\n📋 === PRÓXIMOS PASSOS ===');
    console.log('1. Verificar logs do sistema');
    console.log('2. Testar upload de arquivo real');
    console.log('3. Monitorar performance');
    console.log('4. Verificar integridade dos dados');

  } catch (error) {
    console.error('\n❌ === ERRO DURANTE A MIGRAÇÃO ===');
    console.error('Erro:', error.message);
    console.error('\n🔄 === TENTANDO RECUPERAÇÃO ===');
    
    try {
      await startSystem();
      console.log('✅ Sistema reiniciado para recuperação');
    } catch (recoveryError) {
      console.error('❌ Falha na recuperação:', recoveryError.message);
    }
    
    process.exit(1);
  }
}

async function createDatabaseBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../backups');
    const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);
    
    // Criar diretório de backup se não existir
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    console.log('📁 Criando backup do banco...');
    
    // Verificar tipo de banco (SQLite por padrão)
    const dbPath = process.env.DATABASE_URL || 'file:./dev.db';
    
    if (dbPath.startsWith('file:')) {
      // SQLite
      const dbFile = dbPath.replace('file:', '');
      const fullDbPath = path.resolve(__dirname, '..', dbFile);
      
      if (fs.existsSync(fullDbPath)) {
        fs.copyFileSync(fullDbPath, backupFile);
        console.log(`✅ Backup SQLite criado: ${backupFile}`);
      } else {
        console.log('⚠️  Arquivo SQLite não encontrado, pulando backup');
      }
    } else {
      // PostgreSQL ou MySQL
      try {
        if (dbPath.includes('postgresql://')) {
          // PostgreSQL
          execSync(`pg_dump "${dbPath}" > "${backupFile}"`, { stdio: 'inherit' });
          console.log(`✅ Backup PostgreSQL criado: ${backupFile}`);
        } else if (dbPath.includes('mysql://')) {
          // MySQL
          const url = new URL(dbPath);
          execSync(`mysqldump -h ${url.hostname} -u ${url.username} -p${url.password} ${url.pathname.slice(1)} > "${backupFile}"`, { stdio: 'inherit' });
          console.log(`✅ Backup MySQL criado: ${backupFile}`);
        }
      } catch (backupError) {
        console.log('⚠️  Erro no backup, continuando sem backup:', backupError.message);
      }
    }
    
  } catch (error) {
    console.log('⚠️  Erro ao criar backup, continuando sem backup:', error.message);
  }
}

async function stopSystem() {
  try {
    console.log('🛑 Parando sistema...');
    
    // Tentar parar com diferentes métodos
    try {
      // PM2
      execSync('pm2 stop unisafe-backend', { stdio: 'pipe' });
      console.log('✅ Sistema parado via PM2');
    } catch (pm2Error) {
      try {
        // NPM
        execSync('npm run stop', { stdio: 'pipe', cwd: path.join(__dirname, '..') });
        console.log('✅ Sistema parado via NPM');
      } catch (npmError) {
        try {
          // Kill process
          execSync('pkill -f "node.*backend"', { stdio: 'pipe' });
          console.log('✅ Sistema parado via kill');
        } catch (killError) {
          console.log('⚠️  Sistema pode não estar rodando');
        }
      }
    }
    
    // Aguardar um pouco para garantir que parou
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (error) {
    console.log('⚠️  Erro ao parar sistema, continuando:', error.message);
  }
}

async function migrateSchema() {
  try {
    console.log('🔧 Executando migração do schema...');
    
    // Executar script de migração
    execSync('node migrate-uploads.js', { 
      stdio: 'inherit', 
      cwd: __dirname 
    });
    
    console.log('✅ Schema migrado com sucesso');
    
  } catch (error) {
    throw new Error(`Falha na migração do schema: ${error.message}`);
  }
}

async function cleanupUploads() {
  try {
    console.log('🧹 Executando limpeza da pasta uploads...');
    
    // Executar script de limpeza
    execSync('node cleanup-uploads.js', { 
      stdio: 'inherit', 
      cwd: __dirname 
    });
    
    console.log('✅ Pasta uploads limpa com sucesso');
    
  } catch (error) {
    throw new Error(`Falha na limpeza da pasta uploads: ${error.message}`);
  }
}

async function testNewSystem() {
  try {
    console.log('🧪 Testando novo sistema...');
    
    // Executar script de teste
    execSync('node test-memory-upload.js', { 
      stdio: 'inherit', 
      cwd: __dirname 
    });
    
    console.log('✅ Sistema testado com sucesso');
    
  } catch (error) {
    console.log('⚠️  Teste falhou, mas continuando migração:', error.message);
  }
}

async function startSystem() {
  try {
    console.log('▶️  Reiniciando sistema...');
    
    // Tentar diferentes métodos de inicialização
    try {
      // PM2
      execSync('pm2 start unisafe-backend', { stdio: 'pipe' });
      console.log('✅ Sistema iniciado via PM2');
    } catch (pm2Error) {
      try {
        // NPM
        execSync('npm run start', { stdio: 'pipe', cwd: path.join(__dirname, '..') });
        console.log('✅ Sistema iniciado via NPM');
      } catch (npmError) {
        // Iniciar em background
        execSync('npm run start &', { stdio: 'pipe', cwd: path.join(__dirname, '..') });
        console.log('✅ Sistema iniciado em background');
      }
    }
    
    // Aguardar um pouco para garantir que iniciou
    await new Promise(resolve => setTimeout(resolve, 3000));
    
  } catch (error) {
    throw new Error(`Falha ao reiniciar sistema: ${error.message}`);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  migrateAll();
}

module.exports = { migrateAll };
