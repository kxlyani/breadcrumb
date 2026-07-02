import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@breadcrumb/api-client': path.resolve(__dirname, '../../packages/api-client/src/index.ts'),
      '@breadcrumb/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@breadcrumb/utils': path.resolve(__dirname, '../../packages/utils/src/index.ts'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})