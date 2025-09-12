const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugEmployeeData() {
  try {
    console.log('🔍 === DEBUG DA TABELA EMPLOYEE_DATA ===');
    
    // Buscar todos os registros da tabela employeeData
    const allEmployeeData = await prisma.employeeData.findMany({
      take: 5, // Limitar a 5 registros para não sobrecarregar
      orderBy: {
        processedAt: 'desc'
      }
    });

    console.log(`📊 Total de registros encontrados: ${allEmployeeData.length}`);

    if (allEmployeeData.length === 0) {
      console.log('❌ Nenhum registro encontrado na tabela employeeData');
      return;
    }

    // Analisar cada registro
    allEmployeeData.forEach((record, index) => {
      console.log(`\n📋 === REGISTRO ${index + 1} ===`);
      console.log(`🆔 ID: ${record.id}`);
      console.log(`📁 Upload ID: ${record.uploadId}`);
      console.log(`🏢 Empresa ID: ${record.id_empresa}`);
      console.log(`⏰ Processado em: ${record.processedAt}`);
      
      // Analisar a estrutura dos dados
      const employeeData = record.employeeData;
      console.log(`📊 Tipo dos dados: ${typeof employeeData}`);
      console.log(`📊 É objeto? ${typeof employeeData === 'object'}`);
      console.log(`📊 É array? ${Array.isArray(employeeData)}`);
      
      if (typeof employeeData === 'object' && employeeData !== null) {
        console.log(`🔍 Chaves disponíveis:`, Object.keys(employeeData));
        
        // Verificar se há colunas de data
        const dateColumns = Object.keys(employeeData).filter(key => 
          key.toLowerCase().includes('data') || 
          key.toLowerCase().includes('nasc') || 
          key.toLowerCase().includes('admiss') ||
          key.toLowerCase().includes('afast')
        );
        
        console.log(`📅 Colunas que podem conter datas:`, dateColumns);
        
        // Mostrar valores das colunas de data
        dateColumns.forEach(col => {
          const value = employeeData[col];
          console.log(`📅 ${col}: "${value}" (tipo: ${typeof value})`);
        });
        
        // Mostrar algumas colunas de exemplo
        const sampleColumns = Object.keys(employeeData).slice(0, 5);
        console.log(`📋 Exemplo de colunas:`, sampleColumns);
        sampleColumns.forEach(col => {
          const value = employeeData[col];
          console.log(`  ${col}: "${value}" (tipo: ${typeof value})`);
        });
      }
      
      console.log(`==============================`);
    });

    // Verificar se há uploads disponíveis
    console.log(`\n📁 === VERIFICANDO UPLOADS ===`);
    const uploads = await prisma.upload.findMany({
      take: 5,
      orderBy: {
        uploadedAt: 'desc'
      },
      select: {
        id: true,
        originalName: true,
        status: true,
        uploadedAt: true,
        totalRecords: true,
        processedRecords: true
      }
    });

    console.log(`📊 Uploads encontrados: ${uploads.length}`);
    uploads.forEach((upload, index) => {
      console.log(`\n📁 Upload ${index + 1}:`);
      console.log(`  🆔 ID: ${upload.id}`);
      console.log(`  📄 Nome: ${upload.originalName}`);
      console.log(`  📊 Status: ${upload.status}`);
      console.log(`  ⏰ Upload: ${upload.uploadedAt}`);
      console.log(`  📈 Total: ${upload.totalRecords || 'N/A'}`);
      console.log(`  ✅ Processados: ${upload.processedRecords || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Erro ao debugar employeeData:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o debug
debugEmployeeData();
