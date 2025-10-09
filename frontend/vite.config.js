import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This proxies any requests from /api to our backend server
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Your backend address
        changeOrigin: true,
      }
    }
  }
})