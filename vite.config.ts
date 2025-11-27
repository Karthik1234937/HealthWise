import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:5000')
      },
      build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              ui: ['lucide-react'],
              charts: ['recharts']
            }
          }
        },
        chunkSizeWarningLimit: 1000
      },
      preview: {
        port: 3000,
        host: '0.0.0.0'
      }
    };
});
