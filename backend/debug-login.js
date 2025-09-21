const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugLogin() {
  try {
    console.log('🔍 Debugando login da usuária fabyghira19@gmail.com...');
    
    const email = 'fabyghira19@gmail.com';
    const password = '123456';
    
    console.log('📧 Email original:', email);
    console.log('📧 Email processado:', email.toLowerCase().trim());
    
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    
    console.log('🔍 Usuário encontrado:', user ? 'Sim' : 'Não');
    
    if (user) {
      console.log('📊 Dados do usuário:');
      console.log('  - ID:', user.id_usuario);
      console.log('  - Nome:', user.nome);
      console.log('  - Email:', user.email);
      console.log('  - Perfil:', user.perfil);
      console.log('  - Base Sindical:', user.base_sindical);
      console.log('  - ID Empresa:', user.id_empresa);
      
      // Verificar senha
      console.log('\n🔐 Verificando senha...');
      const isValidPassword = await bcrypt.compare(password, user.senha);
      console.log('🔐 Senha válida:', isValidPassword);
      
      if (isValidPassword) {
        console.log('✅ Login deveria funcionar!');
        
        // Buscar empresa
        if (user.id_empresa) {
          const empresa = await prisma.company.findUnique({
            where: { id_empresa: user.id_empresa },
            select: {
              nome_fantasia: true,
              razao_social: true,
              cnpj: true
            }
          });
          
          console.log('🏢 Empresa:', empresa);
        }
      } else {
        console.log('❌ Senha inválida');
      }
    } else {
      console.log('❌ Usuário não encontrado');
      
      // Verificar se existe com email diferente
      const similarUsers = await prisma.user.findMany({
        where: {
          email: {
            contains: 'fabyghira'
          }
        }
      });
      
      console.log('🔍 Usuários similares encontrados:', similarUsers.length);
      similarUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.nome})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogin();
