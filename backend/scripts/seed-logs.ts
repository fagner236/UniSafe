import { PrismaClient } from '@prisma/client';
import SystemLogger from '../src/utils/logger';

const prisma = new PrismaClient();

async function seedLogs() {
  try {
    console.log('🌱 Iniciando seed de logs do sistema...');

    // Verificar se já existem logs
    const existingLogs = await prisma.systemLog.count();
    if (existingLogs > 0) {
      console.log(`📋 Já existem ${existingLogs} logs no sistema. Pulando seed.`);
      return;
    }

    // Buscar usuários e empresas existentes
    const users = await prisma.user.findMany({
      include: { empresa: true }
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado. Execute o seed de usuários primeiro.');
      return;
    }

    console.log(`👥 Usuários encontrados: ${users.length}`);
    console.log(`🏢 Empresas encontradas: ${users.filter(u => u.empresa).length}`);

    // Logs de exemplo para demonstração
    const sampleLogs = [
      // Logs de autenticação
      {
        level: 'AUDIT' as const,
        category: 'AUTH' as const,
        message: 'Usuário fez login no sistema',
        userId: users[0]?.id_usuario,
        userEmail: users[0]?.email,
        userProfile: users[0]?.perfil,
        companyId: users[0]?.empresa?.id_empresa,
        companyName: users[0]?.empresa?.nome_fantasia || users[0]?.empresa?.razao_social,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session_001',
        action: 'LOGIN',
        resource: '/api/auth/login'
      },
      {
        level: 'AUDIT' as const,
        category: 'AUTH' as const,
        message: 'Usuário fez logout do sistema',
        userId: users[0]?.id_usuario,
        userEmail: users[0]?.email,
        userProfile: users[0]?.perfil,
        companyId: users[0]?.empresa?.id_empresa,
        companyName: users[0]?.empresa?.nome_fantasia || users[0]?.empresa?.razao_social,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session_001',
        action: 'LOGOUT',
        resource: '/api/auth/logout'
      },

      // Logs de usuários
      {
        level: 'AUDIT' as const,
        category: 'USER' as const,
        message: 'Perfil do usuário atualizado',
        userId: users[0]?.id_usuario,
        userEmail: users[0]?.email,
        userProfile: users[0]?.perfil,
        companyId: users[0]?.empresa?.id_empresa,
        companyName: users[0]?.empresa?.nome_fantasia || users[0]?.empresa?.razao_social,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session_001',
        action: 'UPDATE_PROFILE',
        resource: '/api/users/profile'
      },

      // Logs de empresas
      {
        level: 'AUDIT' as const,
        category: 'COMPANY' as const,
        message: 'Nova empresa cadastrada no sistema',
        userId: users[0]?.id_usuario,
        userEmail: users[0]?.email,
        userProfile: users[0]?.perfil,
        companyId: users[0]?.empresa?.id_empresa,
        companyName: users[0]?.empresa?.nome_fantasia || users[0]?.empresa?.razao_social,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session_001',
        action: 'CREATE_COMPANY',
        resource: '/api/companies',
        details: { cnpj: '12.345.678/0001-90', razao_social: 'Empresa Exemplo LTDA' }
      },

      // Logs de upload
      {
        level: 'INFO' as const,
        category: 'UPLOAD' as const,
        message: 'Arquivo Excel enviado para processamento',
        userId: users[0]?.id_usuario,
        userEmail: users[0]?.email,
        userProfile: users[0]?.perfil,
        companyId: users[0]?.empresa?.id_empresa,
        companyName: users[0]?.empresa?.nome_fantasia || users[0]?.empresa?.razao_social,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session_001',
        action: 'UPLOAD_FILE',
        resource: '/api/upload',
        details: { filename: 'funcionarios.xlsx', size: 1024000, mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      },

      // Logs do sistema
      {
        level: 'INFO' as const,
        category: 'SYSTEM' as const,
        message: 'Sistema iniciado com sucesso',
        ipAddress: '127.0.0.1',
        userAgent: 'Node.js/18.0.0',
        action: 'SYSTEM_START',
        resource: 'server'
      },
      {
        level: 'INFO' as const,
        category: 'SYSTEM' as const,
        message: 'Backup automático executado',
        ipAddress: '127.0.0.1',
        userAgent: 'Node.js/18.0.0',
        action: 'AUTO_BACKUP',
        resource: 'database',
        details: { backupSize: '2.4 GB', duration: '5m 30s' }
      },

      // Logs de segurança
      {
        level: 'WARN' as const,
        category: 'SECURITY' as const,
        message: 'Tentativa de acesso não autorizado',
        ipAddress: '203.0.113.1',
        userAgent: 'Mozilla/5.0 (compatible; Bot/1.0)',
        action: 'UNAUTHORIZED_ACCESS',
        resource: '/api/admin',
        details: { reason: 'IP não autorizado', blocked: true }
      },
      {
        level: 'WARN' as const,
        category: 'SECURITY' as const,
        message: 'Múltiplas tentativas de login falharam',
        ipAddress: '198.51.100.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        action: 'LOGIN_ATTEMPT',
        resource: '/api/auth/login',
        details: { attempts: 5, blocked: true, duration: '15m' }
      },

      // Logs de erro
      {
        level: 'ERROR' as const,
        category: 'SYSTEM' as const,
        message: 'Erro ao conectar com banco de dados',
        ipAddress: '127.0.0.1',
        userAgent: 'Node.js/18.0.0',
        action: 'DB_CONNECTION_ERROR',
        resource: 'database',
        details: { error: 'Connection timeout', retryCount: 3 }
      },

      // Logs de debug
      {
        level: 'DEBUG' as const,
        category: 'SYSTEM' as const,
        message: 'Verificação de saúde do sistema executada',
        ipAddress: '127.0.0.1',
        userAgent: 'Node.js/18.0.0',
        action: 'HEALTH_CHECK',
        resource: 'system',
        details: { memory: '512 MB', cpu: '15%', uptime: '24h 30m' }
      }
    ];

    // Criar logs usando o SystemLogger
    console.log('📝 Criando logs de exemplo...');
    
    for (const logData of sampleLogs) {
      try {
        await SystemLogger.log(logData);
        console.log(`✅ Log criado: ${logData.message}`);
      } catch (error) {
        console.error(`❌ Erro ao criar log: ${logData.message}`, error);
      }
    }

    // Adicionar mais logs com timestamps variados para demonstração
    console.log('📅 Criando logs com timestamps variados...');
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const timeVariedLogs = [
      {
        timestamp: oneDayAgo,
        level: 'INFO' as const,
        category: 'USER' as const,
        message: 'Usuário acessou dashboard',
        userId: users[0]?.id_usuario,
        userEmail: users[0]?.email,
        userProfile: users[0]?.perfil,
        companyId: users[0]?.empresa?.id_empresa,
        companyName: users[0]?.empresa?.nome_fantasia || users[0]?.empresa?.razao_social,
        action: 'ACCESS_DASHBOARD',
        resource: '/dashboard'
      },
      {
        timestamp: twoDaysAgo,
        level: 'INFO' as const,
        category: 'UPLOAD' as const,
        message: 'Relatório gerado com sucesso',
        userId: users[0]?.id_usuario,
        userEmail: users[0]?.email,
        userProfile: users[0]?.perfil,
        companyId: users[0]?.empresa?.id_empresa,
        companyName: users[0]?.empresa?.nome_fantasia || users[0]?.empresa?.razao_social,
        action: 'GENERATE_REPORT',
        resource: '/api/reports',
        details: { reportType: 'funcionarios', format: 'PDF', records: 150 }
      },
      {
        timestamp: oneWeekAgo,
        level: 'AUDIT' as const,
        category: 'COMPANY' as const,
        message: 'Configurações da empresa atualizadas',
        userId: users[0]?.id_usuario,
        userEmail: users[0]?.email,
        userProfile: users[0]?.perfil,
        companyId: users[0]?.empresa?.id_empresa,
        companyName: users[0]?.empresa?.nome_fantasia || users[0]?.empresa?.razao_social,
        action: 'UPDATE_COMPANY_SETTINGS',
        resource: '/api/companies/settings',
        details: { updatedFields: ['endereco', 'cidade'], oldValues: { endereco: 'Rua Antiga, 123', cidade: 'Cidade Antiga' } }
      }
    ];

    for (const logData of timeVariedLogs) {
      try {
        await prisma.systemLog.create({
          data: {
            timestamp: logData.timestamp,
            level: logData.level,
            category: logData.category,
            message: logData.message,
            userId: logData.userId,
            userEmail: logData.userEmail,
            userProfile: logData.userProfile,
            companyId: logData.companyId,
            companyName: logData.companyName,
            action: logData.action,
            resource: logData.resource,
            details: logData.details
          }
        });
        console.log(`✅ Log com timestamp variado criado: ${logData.message}`);
      } catch (error) {
        console.error(`❌ Erro ao criar log com timestamp: ${logData.message}`, error);
      }
    }

    const totalLogs = await prisma.systemLog.count();
    console.log(`🎉 Seed de logs concluído! Total de logs criados: ${totalLogs}`);

  } catch (error) {
    console.error('❌ Erro durante seed de logs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedLogs()
    .then(() => {
      console.log('✅ Script de seed de logs executado com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro ao executar script de seed de logs:', error);
      process.exit(1);
    });
}

export default seedLogs;
