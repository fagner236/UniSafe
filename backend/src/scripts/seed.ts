import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Verificar se já existe um usuário admin
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@sindicato.com' }
  });

  if (existingAdmin) {
    console.log('✅ Usuário admin já existe');
    return;
  }

  // Criar hash da senha
  const hashedPassword = await bcrypt.hash('admin123', 12);

  // Criar usuário administrador
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@sindicato.com',
      password: hashedPassword,
      role: 'admin'
    }
  });

  console.log('✅ Usuário administrador criado com sucesso!');
  console.log('📧 Email: admin@sindicato.com');
  console.log('🔑 Senha: admin123');
  console.log('👤 Nome: Administrador');
  console.log('🔐 Role: admin');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
