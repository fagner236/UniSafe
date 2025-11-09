import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  renderTime: number;
  memoryUsage?: number;
}

/**
 * Hook para monitorar performance de componentes
 * Coleta métricas básicas de performance e pode enviar para serviço de monitoramento
 */
export const usePerformanceMonitor = (componentName: string, enabled: boolean = true) => {
  const renderStartTime = useRef<number>(Date.now());
  const mountTime = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Medir tempo de montagem
    mountTime.current = Date.now();
    const mountDuration = mountTime.current - renderStartTime.current;

    // Coletar métricas de performance
    const metrics: PerformanceMetrics = {
      pageLoadTime: mountDuration,
      renderTime: mountDuration,
    };

    // Verificar se Performance API está disponível
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        const perfEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (perfEntries.length > 0) {
          const navTiming = perfEntries[0];
          metrics.pageLoadTime = navTiming.loadEventEnd - navTiming.fetchStart;
        }

        // Coletar uso de memória (se disponível)
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          metrics.memoryUsage = memory.usedJSHeapSize / 1048576; // Converter para MB
        }
      } catch (error) {
        console.warn('Erro ao coletar métricas de performance:', error);
      }
    }

    // Log em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance [${componentName}]:`, metrics);
    }

    // Aqui você pode enviar para serviço de monitoramento
    // Exemplo: Google Analytics, Sentry, etc.
    if (process.env.NODE_ENV === 'production') {
      // sendToMonitoringService(componentName, metrics);
    }

    // Cleanup
    return () => {
      // Medir tempo de desmontagem se necessário
    };
  }, [componentName, enabled]);

  return {
    startMeasure: () => {
      renderStartTime.current = Date.now();
    },
    endMeasure: () => {
      if (mountTime.current) {
        return Date.now() - mountTime.current;
      }
      return 0;
    },
  };
};

/**
 * Hook para medir tempo de execução de funções
 */
export const usePerformanceMeasure = (label: string) => {
  const measure = (fn: () => void) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${label}-start`);
      fn();
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      
      const measure = performance.getEntriesByName(label)[0];
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${label}: ${measure.duration.toFixed(2)}ms`);
      }
      
      // Limpar marks
      performance.clearMarks(`${label}-start`);
      performance.clearMarks(`${label}-end`);
      performance.clearMeasures(label);
    } else {
      fn();
    }
  };

  return { measure };
};

