const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('🔍 Verificando usuária fabyghira19@gmail.com...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'fabyghira19@gmail.com' },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        perfil: true,
        base_sindical: true,
        id_empresa: true,
        empresa: {
          select: {
            id_empresa: true,
            razao_social: true,
            nome_fantasia: true,
            cnpj: true
          }
        }
      }
    });
    
    if (user) {
      console.log('✅ Usuária encontrada:');
      console.log('📊 ID:', user.id_usuario);
      console.log('📊 Nome:', user.nome);
      console.log('📊 Email:', user.email);
      console.log('📊 Perfil:', user.perfil);
      console.log('📊 Base Sindical:', user.base_sindical);
      console.log('📊 ID Empresa:', user.id_empresa);
      console.log('📊 Empresa:', user.empresa);
    } else {
      console.log('❌ Usuária não encontrada');
    }
    
    // Verificar todas as usuárias com email similar
    const similarUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: 'fabyghira'
        }
      },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        perfil: true,
        base_sindical: true,
        id_empresa: true
      }
    });
    
    console.log('\n🔍 Usuárias com email similar:');
    similarUsers.forEach(u => {
      console.log(`- ${u.email} (${u.nome}) - Base: ${u.base_sindical}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
