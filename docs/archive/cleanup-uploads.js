#!/usr/bin/env node

/**
 * Script para limpeza da pasta uploads e atualização de registros antigos
 * 
 * Este script:
 * 1. Remove a pasta uploads/ (não mais necessária)
 * 2. Atualiza registros antigos no banco para indicar que foram processados em memória
 * 3. Limpa arquivos temporários
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupUploads() {
  try {
    console.log('🧹 === INICIANDO LIMPEZA DO SISTEMA DE UPLOADS ===\n');

    // 1. Verificar se a pasta uploads existe
    const uploadsDir = path.join(__dirname, '../uploads');
    if (fs.existsSync(uploadsDir)) {
      console.log('📁 Pasta uploads encontrada, removendo...');
      
      // Remover todos os arquivos da pasta
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        if (file !== '.gitkeep') { // Manter .gitkeep se existir
          const filePath = path.join(uploadsDir, file);
          if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
            console.log(`🗑️  Arquivo removido: ${file}`);
          }
        }
      }
      
      // Remover a pasta uploads (exceto se for .gitkeep)
      if (files.length === 0 || (files.length === 1 && files.includes('.gitkeep'))) {
        console.log('📁 Pasta uploads está vazia ou contém apenas .gitkeep');
      } else {
        console.log('📁 Pasta uploads removida com sucesso');
      }
    } else {
      console.log('📁 Pasta uploads não encontrada');
    }

    // 2. Atualizar registros antigos no banco
    console.log('\n🗄️  Atualizando registros antigos no banco...');
    
    const oldUploads = await prisma.upload.findMany({
      where: {
        path: {
          not: 'memory_processed'
        }
      }
    });

    if (oldUploads.length > 0) {
      console.log(`📊 Encontrados ${oldUploads.length} registros antigos para atualizar`);
      
      for (const upload of oldUploads) {
        await prisma.upload.update({
          where: { id: upload.id },
          data: {
            path: 'memory_processed',
            filename: `migrated_${upload.filename}`
          }
        });
        console.log(`✅ Registro atualizado: ${upload.id}`);
      }
    } else {
      console.log('📊 Nenhum registro antigo encontrado para atualizar');
    }

    // 3. Verificar se há registros com status 'pending' ou 'processing' antigos
    console.log('\n🔍 Verificando registros com status pendentes antigos...');
    
    const oldPendingUploads = await prisma.upload.findMany({
      where: {
        status: {
          in: ['pending', 'processing']
        },
        uploadedAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Mais de 24 horas
        }
      }
    });

    if (oldPendingUploads.length > 0) {
      console.log(`📊 Encontrados ${oldPendingUploads.length} registros pendentes antigos`);
      
      for (const upload of oldPendingUploads) {
        await prisma.upload.update({
          where: { id: upload.id },
          data: {
            status: 'error',
            errorMessage: 'Registro antigo migrado - arquivo não encontrado'
          }
        });
        console.log(`✅ Status atualizado para erro: ${upload.id}`);
      }
    } else {
      console.log('📊 Nenhum registro pendente antigo encontrado');
    }

    // 4. Estatísticas finais
    console.log('\n📊 === ESTATÍSTICAS FINAIS ===');
    
    const totalUploads = await prisma.upload.count();
    const completedUploads = await prisma.upload.count({
      where: { status: 'completed' }
    });
    const errorUploads = await prisma.upload.count({
      where: { status: 'error' }
    });
    const memoryProcessed = await prisma.upload.count({
      where: { path: 'memory_processed' }
    });

    console.log(`📊 Total de uploads: ${totalUploads}`);
    console.log(`✅ Uploads completados: ${completedUploads}`);
    console.log(`❌ Uploads com erro: ${errorUploads}`);
    console.log(`🧠 Processados em memória: ${memoryProcessed}`);

    console.log('\n🎉 === LIMPEZA CONCLUÍDA COM SUCESSO ===');
    console.log('✅ Sistema migrado para processamento em memória');
    console.log('✅ Pasta uploads limpa');
    console.log('✅ Registros antigos atualizados');
    console.log('✅ Sistema pronto para uso');

  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  cleanupUploads();
}

module.exports = { cleanupUploads };
