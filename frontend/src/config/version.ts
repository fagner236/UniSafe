// 📋 CONFIGURAÇÃO DE VERSÃO DO SISTEMA UNISAFE
// Este arquivo controla a versão do sistema de forma centralizada

export const APP_VERSION = '1.9.4';
export const APP_NAME = 'UniSafe';
export const APP_DESCRIPTION = 'Sistema de Gestão de Funcionários e Empresas';
export const APP_AUTHOR = 'Evia';
export const APP_WEBSITE = 'https://evia.com.br';

export const VERSION_FEATURES = [
  'Gestão de dados e criação de dashboards',
  'Isolamento completo de dados por organização',
  'Privilégios especiais para admin da empresa dona',
  'Segurança aprimorada com filtros granulares',
  'Compatibilidade com schema atualizado',
  'Interface adaptativa por base sindical',
  'Prevenção de vazamento de dados',
  'Sistema de permissões robusto'
];

export const VERSION_HISTORY = [
  {
    version: '1.9.4',
    date: 'Novembro 2025',
    features: [
      '📄 Exportação em PDF com lista de presença',
      '📋 Colunas específicas: Nome, Matrícula, Filiado, Data e Assinatura',
      '📊 Cabeçalho com informações do Sindicato, SE, Município e Unidade',
      '📈 Estatísticas de filiação no cabeçalho (total, filiados e não filiados com percentuais)',
      '📑 Agrupamento por unidade com nova página para cada unidade',
      '🎨 Destaque visual para empregados filiados (fundo cinza claro)',
      '📝 Campo Data pré-preenchido com mês e ano da extração',
      '🔍 Ordenação alfabética por nome',
      '📊 Sistema de logs de exportação (Excel, CSV e PDF)',
      '🌐 Captura aprimorada de IP e Session ID nos logs',
      '👁️ Correção da lógica do ícone de visualização de detalhes nos logs',
      '💾 Persistência da Base Sindical selecionada no Dashboard'
    ]
  },
  {
    version: '1.9.3',
    date: 'Novembro 2025',
    features: [
      '🚀 Atualização completa do stack tecnológico',
      '⚡ Node.js atualizado para 24.11.0 LTS',
      '⚛️ React atualizado para 19.2.0',
      '📦 TypeScript atualizado para 5.9.3',
      '🔧 Prisma atualizado para 6.19.0',
      '💾 Redis Client atualizado para 5.9.0',
      '🎨 Vite atualizado para 5.4.21',
      '🛡️ Todas as dependências atualizadas',
      '✅ Sistema 100% atualizado e funcionando',
      '📊 Performance e segurança melhoradas'
    ]
  },
  {
    version: '1.9.1',
    date: 'Setembro 2024',
    features: [
      '📊 Análise Avançada de Filiação no Dashboard',
      '🎂 Coluna FILIADO na tabela de Aniversariantes da Semana',
      '🎨 Highlight Interativo no gráfico de Jornadas de Trabalho',
      '🔧 Substituição automática de "01/01/1900" por "-" na DATA_AFAST',
      '🎯 Padronização Visual dos cards de aviso em todo o sistema',
      '✨ Melhorias na Experiência do Usuário e Interatividade',
      '⚡ Otimizações de Performance e Formatação de Dados',
      '🎨 Design System Consistente e Profissional',
      '📱 Interface Mais Intuitiva e Responsiva',
      '✅ Funcionalidades Avançadas de Análise de Dados'
    ]
  },
  {
    version: '1.8.9',
    date: 'Setembro 2025',
    features: [
      '🎨 Layout Otimizado do Dashboard',
      '📱 Card de Informações em Linha Separada',
      '🔧 Organização Visual Melhorada',
      '📊 Hierarquia Clara de Elementos',
      '🎯 Experiência do Usuário Aprimorada',
      '📱 Layout Responsivo Aprimorado',
      '✨ Interface Mais Limpa e Organizada',
      '🔄 Fluxo Natural de Navegação',
      '📋 Informações Destacadas Adequadamente',
      '✅ Estrutura Visual Otimizada'
    ]
  },
  {
    version: '1.8.8',
    date: 'Janeiro 2025',
    features: [
      '🛡️ Sistema Totalmente Estabilizado',
      '⚡ Performance Otimizada (+40%)',
      '📤 Sistema de Exportação Completo',
      '🎨 Interface Profissional Unificada',
      '🔍 Sistema de Debugging Avançado',
      '📊 Métricas de Performance em Tempo Real',
      '🛡️ Segurança e Confiabilidade Aprimoradas',
      '🎯 Experiência do Usuário Significativamente Melhorada',
      '📱 Responsividade Total para Mobile e Desktop',
      '✅ Zero Bugs Críticos Identificados'
    ]
  },
  {
    version: '1.8.7',
    date: 'Janeiro 2025',
    features: [
      '⏳ Sistema de Loading Inteligente no Dashboard',
      '📊 Barra de progresso com etapas detalhadas',
      '🎨 Modal de loading com design moderno',
      '📱 Melhorias na tela de login mobile',
      '🔧 Ajustes no posicionamento do logo UniSafe',
      '📤 Modal de exportação na Base de Dados',
      '📋 Suporte a Excel e CSV (PDF removido)',
      '🎯 Interface mais limpa e focada',
      '🔍 Logs detalhados para debugging',
      '⚡ Performance otimizada em todas as operações'
    ]
  },
  {
    version: '1.8.6',
    date: 'Janeiro 2025',
    features: [
      '👥 Melhorias na Gestão de Usuários',
      '📝 Campo Base Sindical como texto livre',
      '🏢 Seleção obrigatória de empresa',
      '🔍 Modal de visualização de usuários',
      '🖨️ Funcionalidade de impressão de dados',
      '🎨 Interface padronizada e moderna',
      '🔒 Validações aprimoradas',
      '⚡ Senha padrão unificada (123456)'
    ]
  },
  {
    version: '1.8.5',
    date: 'Setembro 2025',
    features: [
      '📊 Gestão de dados e criação de dashboards',
      '🛡️ Isolamento completo de dados por organização',
      '👑 Privilégios especiais para admin da empresa dona',
      '🔐 Segurança aprimorada com filtros granulares',
      '⚙️ Compatibilidade com schema atualizado',
      '🎯 Interface adaptativa por base sindical',
      '🚫 Prevenção de vazamento de dados',
      '🔑 Sistema de permissões robusto'
    ]
  },
  {
    version: '1.8.4',
    date: 'Dezembro 2024',
    features: [
      '🎨 Interface Limpa e Profissional',
      '🚫 Rodapé oculto em todas as páginas principais',
      '⚡ Filtros do Dashboard 2.5x mais rápidos',
      '🔍 Busca em tempo real implementada',
      '🧠 Processamento em memória otimizado',
      '🎯 Design unificado e responsivo',
      '🧭 Navegação consistente entre páginas',
      '✨ Sistema mais limpo e focado'
    ]
  },
  {
    version: '1.8.3',
    date: 'Janeiro 2025',
    features: [
      '🚀 Sistema de Uploads 100% em Memória',
      '🔒 Eliminação completa do armazenamento físico de arquivos',
      '⚡ Processamento otimizado sem I/O de disco',
      '📈 Escalabilidade ilimitada sem restrições de disco',
      '🔧 Manutenção simplificada com 70% menos tarefas',
      '💾 Backup simplificado (apenas banco de dados)',
      '🧠 Processamento direto do buffer de memória',
      '🛡️ Segurança aprimorada sem arquivos expostos'
    ]
  },
  {
    version: '1.8.0',
    date: 'Agosto 2025',
    features: [
      'Sistema de busca expandida no Dashboard',
      'Busca inteligente na coluna LOTAÇÃO da base de dados',
      'Suporte a sinônimos em português e inglês',
      'Processamento dinâmico de estatísticas em tempo real',
      'Interface consistente com outros tópicos do Dashboard',
      'Busca em duas fases para performance otimizada'
    ]
  },
  {
    version: '1.7.2',
    date: 'Agosto 2025',
    features: [
      'Melhorias no tópico "Motivo de Afastamento"',
      'Limitação para exibir apenas os 10 principais motivos',
      'Colunas "FILIADOS" e "NÃO FILIADOS" na tabela',
      'Cálculo automático de distribuição de filiação',
      'Formatação visual com cores (verde/vermelho)',
      'Nomenclatura "Total de Empregados" no card principal'
    ]
  },
  {
    version: '1.7.0',
    date: 'Agosto 2025',
    features: [
      'Sistema de controle de acesso por empresa',
      'Menu Sistema condicional apenas para empresa dona',
      'Unificação da paleta de cores (#c9504c)',
      'Correção de problemas de codificação de caracteres',
      'Interface adaptativa por perfil de empresa',
      'Limpeza de 26 arquivos não utilizados'
    ]
  },
  {
    version: '1.6.2',
    date: 'Agosto 2025',
    features: [
      'Atualizações de dependências (React 18.3.0, Express 5.1.0, Prisma 6.14.0)',
      'Sistema de versionamento corrigido e automatizado',
      'Melhorias no sistema de verificação de CNPJ',
      'Configurações de segurança atualizadas',
      'Documentação completa e atualizada',
      'Scripts de versionamento funcionando perfeitamente'
    ]
  },
  {
    version: '1.6.0',
    date: 'Janeiro 2025',
    features: [
      'Sistema de verificação de CNPJ em tempo real',
      'Interface administrativa completa e funcional',
      'Dashboard aprimorado com novas estatísticas',
      'Validação avançada de dados brasileiros',
      'Paleta de cores UniSafe implementada',
      'Sistema de administração completo'
    ]
  },
  {
    version: '1.5.0',
    date: 'Janeiro 2025',
    features: [
      'Menu de Administração do Sistema',
      'Reorganização dos menus principais (Dashboard → Upload → Filiados)',
      'Página de Administração completa',
      'Implementação da paleta de cores UniSafe',
      'Sistema de cores interativo para links e títulos',
      'Interface administrativa responsiva e moderna'
    ]
  },
  {
    version: '1.4.0',
    date: 'Janeiro 2025',
    features: [
      'Tópico Motivo de Afastamento no Dashboard',
      'Tabela simplificada com dados estatísticos',
      'Barras de progresso para percentuais',
      'Remoção da seção Colunas Detectadas',
      'Interface mais limpa e focada'
    ]
  },
  {
    version: '1.3.0',
    date: 'Dezembro 2024',
    features: [
      'Tabela de aniversariantes da semana',
      'Navegação por semanas (anterior/próxima)',
      'Destaque visual para aniversariantes do dia',
      'Sistema de rolagem com barra personalizada',
      'Ordenação inteligente por data e nome'
    ]
  },
  {
    version: '1.2.0',
    date: 'Dezembro 2024',
    features: [
      'Tabela de aniversariantes da semana',
      'Navegação por semanas (anterior/próxima)',
      'Destaque visual para aniversariantes do dia',
      'Sistema de rolagem com barra personalizada',
      'Ordenação inteligente por data e nome'
    ]
  },
  {
    version: '1.1.0',
    date: 'Agosto 2025',
    features: [
      'Correções de títulos e layout',
      'Ajustes de proporção visual',
      'Otimização de cores e espaçamentos'
    ]
  },
  {
    version: '1.0.0',
    date: 'Agosto 2025',
    features: [
      'Dashboard completo com 5 visualizações',
      'Sistema de cores UniSafe',
      'Interface responsiva mobile-first',
      'Animações e transições suaves'
    ]
  }
];

// Informações adicionais da versão
export const VERSION_INFO = {
  version: APP_VERSION,
  name: APP_NAME,
  description: APP_DESCRIPTION,
  author: APP_AUTHOR,
  website: APP_WEBSITE,
  releaseDate: '2025-11-16',
  changes: [
    '📄 Exportação em PDF com lista de presença',
    '📋 Colunas específicas: Nome, Matrícula, Filiado, Data e Assinatura',
    '📊 Cabeçalho com informações do Sindicato, SE, Município e Unidade',
    '📈 Estatísticas de filiação no cabeçalho (total, filiados e não filiados com percentuais)',
    '📑 Agrupamento por unidade com nova página para cada unidade',
    '🎨 Destaque visual para empregados filiados (fundo cinza claro)',
    '📝 Campo Data pré-preenchido com mês e ano da extração',
    '🔍 Ordenação alfabética por nome',
    '📊 Sistema de logs de exportação (Excel, CSV e PDF)',
    '🌐 Captura aprimorada de IP e Session ID nos logs',
    '👁️ Correção da lógica do ícone de visualização de detalhes nos logs',
    '💾 Persistência da Base Sindical selecionada no Dashboard'
  ]
};

// Função para obter a versão formatada
export const getVersionString = (): string => {
  return `v${APP_VERSION}`;
};

// Função para obter informações completas da versão
export const getVersionInfo = () => {
  return {
    ...VERSION_INFO,
    displayVersion: getVersionString()
  };
};

export default VERSION_INFO;
