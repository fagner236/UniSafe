import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { compression } from 'vite-plugin-compression2'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Compressão gzip para todos os assets
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024, // Comprimir apenas arquivos > 1KB
    }),
    // Compressão brotli (melhor compressão, suportado por navegadores modernos)
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024,
      filename: '[path][base].br',
    }),
    // Visualizador de bundle (apenas em produção)
    process.env.ANALYZE === 'true' && visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': resolve('./src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Desabilitar sourcemaps em produção para reduzir tamanho
    minify: 'terser', // Usar terser para melhor minificação
    terserOptions: {
      compress: {
        drop_console: true, // Remover console.log em produção
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remover funções específicas
      },
    },
    rollupOptions: {
      input: {
        main: resolve('index.html'),
      },
      output: {
        // Otimizar chunk splitting para melhor compressão
        manualChunks: {
          // Separar vendor libraries em chunks próprios
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
          'utils-vendor': ['axios', 'xlsx', 'jspdf', 'jspdf-autotable'],
        },
        // Otimizar nomes de arquivos para cache
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/img/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[ext]/[name]-[hash][extname]`;
        },
      },
    },
    // Otimizações de build
    chunkSizeWarningLimit: 1000, // Avisar se chunk > 1MB
    cssCodeSplit: true, // Separar CSS em chunks
    reportCompressedSize: true, // Reportar tamanho comprimido
  },
  server: {
    port: 5173,
    // Proxy apenas para desenvolvimento local
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
