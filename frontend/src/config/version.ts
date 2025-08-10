// 📋 CONFIGURAÇÃO DE VERSÃO DO SISTEMA UNISAFE
// Este arquivo controla a versão do sistema de forma centralizada

export const APP_VERSION = '1.4.0';
export const APP_NAME = 'UniSafe';
export const APP_DESCRIPTION = 'Sistema web moderno para entidades sindicais gerenciarem informações dos empregados filiados';
export const LAST_UPDATE = '2025-01-15';

export const VERSION_FEATURES = [
  'Dashboard completo com visualizações de dados',
  'Tabela de aniversariantes da semana com navegação',
  'Sistema de rolagem personalizado',
  'Destaque para aniversariantes do dia',
  'Tópico Motivo de Afastamento com dados estatísticos',
  'Interface responsiva e moderna',
  'Paleta de cores UniSafe harmoniosa'
];

export const VERSION_HISTORY = [
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
  buildDate: new Date().toISOString(),
  environment: 'development' // Ambiente fixo para frontend
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
