/**
 * Utilitário centralizado para formatação de datas
 * Garante consistência em todo o sistema
 */

/**
 * Formata uma data para o padrão brasileiro DD/MM/AAAA
 * @param value - Valor da data (string, Date, ou null/undefined)
 * @returns String formatada ou '-' se inválida
 */
export const formatDate = (value: any): string => {
  if (!value) return '-';
  
  try {
    const date = new Date(value);
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.warn('Erro ao formatar data:', value, error);
    return '-';
  }
};

/**
 * Formata uma data para o padrão brasileiro com hora DD/MM/AAAA HH:MM
 * @param value - Valor da data (string, Date, ou null/undefined)
 * @returns String formatada ou '-' se inválida
 */
export const formatDateTime = (value: any): string => {
  if (!value) return '-';
  
  try {
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.warn('Erro ao formatar data/hora:', value, error);
    return '-';
  }
};

/**
 * Formata uma data para exibição em tabelas (formato compacto)
 * @param value - Valor da data (string, Date, ou null/undefined)
 * @returns String formatada ou '-' se inválida
 */
export const formatDateCompact = (value: any): string => {
  if (!value) return '-';
  
  try {
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.warn('Erro ao formatar data compacta:', value, error);
    return '-';
  }
};

/**
 * Verifica se um valor é uma data válida
 * @param value - Valor a ser verificado
 * @returns true se for uma data válida
 */
export const isValidDate = (value: any): boolean => {
  if (!value) return false;
  
  try {
    const date = new Date(value);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * Converte string de data para objeto Date
 * @param value - String de data
 * @returns Date object ou null se inválida
 */
export const parseDate = (value: any): Date | null => {
  if (!value) return null;
  
  try {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};
