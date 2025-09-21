#!/usr/bin/env node

/**
 * Script de migração para o novo sistema de uploads em memória
 * 
 * Este script:
 * 1. Aplica as mudanças do schema (campo path opcional)
 * 2. Atualiza registros existentes
 * 3. Verifica a integridade dos dados
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const path = require('path');

const prisma = new PrismaClient();

async function migrateUploads() {
  try {
    console.log('🚀 === INICIANDO MIGRAÇÃO DO SISTEMA DE UPLOADS ===\n');

    // 1. Verificar se o Prisma está configurado
    console.log('🔧 Verificando configuração do Prisma...');
    
    try {
      execSync('npx prisma --version', { stdio: 'pipe' });
      console.log('✅ Prisma CLI encontrado');
    } catch (error) {
      console.log('❌ Prisma CLI não encontrado, instalando...');
      execSync('npm install prisma --save-dev', { stdio: 'inherit' });
    }

    // 2. Gerar cliente Prisma atualizado
    console.log('\n🔧 Gerando cliente Prisma atualizado...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Cliente Prisma gerado');

    // 3. Verificar se há mudanças no schema
    console.log('\n🔍 Verificando mudanças no schema...');
    
    try {
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
      console.log('✅ Schema aplicado ao banco de dados');
    } catch (error) {
      console.log('⚠️  Erro ao aplicar schema, tentando migração...');
      try {
        execSync('npx prisma migrate dev --name update-uploads-schema', { stdio: 'inherit' });
        console.log('✅ Migração aplicada com sucesso');
      } catch (migrateError) {
        console.log('❌ Erro na migração:', migrateError.message);
        throw migrateError;
      }
    }

    // 4. Verificar registros existentes
    console.log('\n📊 Verificando registros existentes...');
    
    const totalUploads = await prisma.upload.count();
    const uploadsWithPath = await prisma.upload.count({
      where: {
        path: {
          not: null
        }
      }
    });
    
    console.log(`📊 Total de uploads: ${totalUploads}`);
    console.log(`📁 Uploads com caminho: ${uploadsWithPath}`);

    // 5. Atualizar registros antigos
    if (uploadsWithPath > 0) {
      console.log('\n🔄 Atualizando registros antigos...');
      
      const oldUploads = await prisma.upload.findMany({
        where: {
          path: {
            not: null
          }
        }
      });

      for (const upload of oldUploads) {
        // Verificar se o arquivo físico ainda existe
        const fileExists = false; // Sempre false agora, pois não temos mais arquivos físicos
        
        if (!fileExists) {
          await prisma.upload.update({
            where: { id: upload.id },
            data: {
              path: 'memory_processed',
              filename: `migrated_${upload.filename}`,
              status: upload.status === 'pending' || upload.status === 'processing' ? 'error' : upload.status,
              errorMessage: upload.status === 'pending' || upload.status === 'processing' ? 
                'Arquivo físico não encontrado - migrado para sistema em memória' : upload.errorMessage
            }
          });
          console.log(`✅ Registro migrado: ${upload.id}`);
        }
      }
    }

    // 6. Verificar integridade dos dados
    console.log('\n🔍 Verificando integridade dos dados...');
    
    const employeeDataCount = await prisma.employeeData.count();
    const orphanedEmployeeData = await prisma.employeeData.count({
      where: {
        upload: null
      }
    });

    console.log(`📊 Total de dados de funcionários: ${employeeDataCount}`);
    console.log(`⚠️  Dados órfãos: ${orphanedEmployeeData}`);

    if (orphanedEmployeeData > 0) {
      console.log('\n🧹 Limpando dados órfãos...');
      
      await prisma.employeeData.deleteMany({
        where: {
          upload: null
        }
      });
      
      console.log(`✅ ${orphanedEmployeeData} registros órfãos removidos`);
    }

    // 7. Estatísticas finais
    console.log('\n📊 === ESTATÍSTICAS FINAIS ===');
    
    const finalUploads = await prisma.upload.count();
    const memoryProcessed = await prisma.upload.count({
      where: { path: 'memory_processed' }
    });
    const finalEmployeeData = await prisma.employeeData.count();

    console.log(`📊 Total de uploads: ${finalUploads}`);
    console.log(`🧠 Processados em memória: ${memoryProcessed}`);
    console.log(`👥 Dados de funcionários: ${finalEmployeeData}`);

    console.log('\n🎉 === MIGRAÇÃO CONCLUÍDA COM SUCESSO ===');
    console.log('✅ Schema atualizado');
    console.log('✅ Registros migrados');
    console.log('✅ Dados limpos');
    console.log('✅ Sistema pronto para processamento em memória');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  migrateUploads();
}

module.exports = { migrateUploads };
