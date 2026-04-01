import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // Temporarily disabled proxy - API calls will fail until you configure the correct Vercel URL
    // Uncomment and set your Vercel URL below once you find it
    /*
    proxy: {
      '/api': {
        target: 'YOUR_VERCEL_URL_HERE', // e.g., 'https://budget-forecast-abc123.vercel.app'
        changeOrigin: true,
        secure: true,
      },
    },
    */
  },
})
