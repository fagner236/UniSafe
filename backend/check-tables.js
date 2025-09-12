const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('🔍 === VERIFICANDO STATUS DAS TABELAS ===');
    
    // Verificar tabela uploads
    console.log('\n📁 === TABELA UPLOADS ===');
    const uploads = await prisma.upload.findMany({
      take: 5,
      orderBy: {
        uploadedAt: 'desc'
      }
    });
    
    console.log(`📊 Total de uploads: ${uploads.length}`);
    if (uploads.length > 0) {
      uploads.forEach((upload, index) => {
        console.log(`\n📁 Upload ${index + 1}:`);
        console.log(`  🆔 ID: ${upload.id}`);
        console.log(`  📄 Nome: ${upload.originalName}`);
        console.log(`  📊 Status: ${upload.status}`);
        console.log(`  ⏰ Upload: ${upload.uploadedAt}`);
        console.log(`  📈 Total: ${upload.totalRecords || 'N/A'}`);
        console.log(`  ✅ Processados: ${upload.processedRecords || 'N/A'}`);
      });
    } else {
      console.log('❌ Nenhum upload encontrado');
    }
    
    // Verificar tabela employeeData
    console.log('\n📊 === TABELA EMPLOYEE_DATA ===');
    const employeeData = await prisma.employeeData.findMany({
      take: 5,
      orderBy: {
        processedAt: 'desc'
      }
    });
    
    console.log(`📊 Total de registros employeeData: ${employeeData.length}`);
    if (employeeData.length > 0) {
      employeeData.forEach((record, index) => {
        console.log(`\n📋 Registro ${index + 1}:`);
        console.log(`  🆔 ID: ${record.id}`);
        console.log(`  📁 Upload ID: ${record.uploadId}`);
        console.log(`  🏢 Empresa ID: ${record.id_empresa}`);
        console.log(`  ⏰ Processado em: ${record.processedAt}`);
        
        const data = record.employeeData;
        if (data && typeof data === 'object') {
          console.log(`  📊 Colunas disponíveis: ${Object.keys(data).length}`);
          console.log(`  🔍 Exemplo de colunas: ${Object.keys(data).slice(0, 5).join(', ')}`);
        }
      });
    } else {
      console.log('❌ Nenhum registro employeeData encontrado');
    }
    
    // Verificar tabela base_dados
    console.log('\n🗄️ === TABELA BASE_DADOS ===');
    const baseDados = await prisma.baseDados.findMany({
      take: 5,
      orderBy: {
        data_criacao: 'desc'
      }
    });
    
    console.log(`📊 Total de registros base_dados: ${baseDados.length}`);
    if (baseDados.length > 0) {
      baseDados.forEach((record, index) => {
        console.log(`\n📋 Registro ${index + 1}:`);
        console.log(`  🆔 ID: ${record.id}`);
        console.log(`  👤 Nome: ${record.nome}`);
        console.log(`  📅 Data Nascimento: ${record.data_nasc}`);
        console.log(`  📅 Data Admissão: ${record.data_admissao}`);
        console.log(`  ⏰ Criado em: ${record.data_criacao}`);
      });
    } else {
      console.log('❌ Nenhum registro base_dados encontrado');
    }
    
    // Verificar tabela empresas
    console.log('\n🏢 === TABELA EMPRESAS ===');
    const empresas = await prisma.company.findMany({
      take: 5
    });
    
    console.log(`📊 Total de empresas: ${empresas.length}`);
    if (empresas.length > 0) {
      empresas.forEach((empresa, index) => {
        console.log(`\n🏢 Empresa ${index + 1}:`);
        console.log(`  🆔 ID: ${empresa.id_empresa}`);
        console.log(`  📄 Nome: ${empresa.razao_social}`);
        console.log(`  🆔 CNPJ: ${empresa.cnpj}`);
      });
    } else {
      console.log('❌ Nenhuma empresa encontrada');
    }
    
    // Verificar tabela usuarios
    console.log('\n👥 === TABELA USUARIOS ===');
    const usuarios = await prisma.user.findMany({
      take: 5
    });
    
    console.log(`📊 Total de usuários: ${usuarios.length}`);
    if (usuarios.length > 0) {
      usuarios.forEach((usuario, index) => {
        console.log(`\n👤 Usuário ${index + 1}:`);
        console.log(`  🆔 ID: ${usuario.id_usuario}`);
        console.log(`  📄 Nome: ${usuario.nome}`);
        console.log(`  📧 Email: ${usuario.email}`);
        console.log(`  👑 Perfil: ${usuario.perfil}`);
        console.log(`  🏢 Empresa ID: ${usuario.id_empresa || 'N/A'}`);
      });
    } else {
      console.log('❌ Nenhum usuário encontrado');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a verificação
checkTables();
