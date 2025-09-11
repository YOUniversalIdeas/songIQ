import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Path aliases removed to fix build issues
    },
  },
  server: {
    port: 3001,
    strictPort: true, // Don't try other ports if 3001 is busy
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2', 'chartjs-adapter-date-fns'],
          ui: ['lucide-react', 'clsx', 'tailwind-merge'],
          forms: ['react-hook-form', 'react-dropzone'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  define: {
    // Suppress React Router v7 warnings
    __REACT_ROUTER_VERSION__: JSON.stringify('6.8.0'),
  },
  esbuild: {
    // Suppress specific warnings
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
}) 