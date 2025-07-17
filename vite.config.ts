import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // or any other port you prefer
    hmr: true,
    proxy: {
      '/api': {
        target: 'http://localhost:80',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      }
    }
  },
  resolve: {
    alias: {
      '@i18n': '/src/i18n'
    }
  },
  assetsInclude: ['**/locales/**']
})