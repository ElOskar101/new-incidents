import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// The proxy target comes from `.env` (override per machine in `.env.local`).
const BACKEND_URL = loadEnv('development', process.cwd(), 'VITE_').VITE_API_BASE_URL

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Framework code changes rarely; its own chunks stay cached across app deploys.
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react'
          if (id.includes('node_modules/react-router/')) return 'router'
          return undefined
        },
      },
    },
  },
  // Development only: forwards API calls to the backend to avoid CORS.
  server: {
    proxy: {
      '/api': { target: BACKEND_URL || 'http://localhost:8000', changeOrigin: true },
    },
  },
})
