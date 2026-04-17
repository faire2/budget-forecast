import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    port: 5173,
    // Proxy configured via VITE_API_BASE_URL environment variable
    // For local dev: Run `vercel dev --listen 3000` first
    // API calls will go to http://localhost:3000/api/*
  },
})
