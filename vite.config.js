import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Handle /api/ghost/* paths (for serverless function simulation in dev)
      '/api/ghost': {
        target: 'http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ghost/, '/ghost/api/content'),
        secure: false, // Allow self-signed certificates
      },
      // Handle other /api/* paths (for other APIs)
      '/api': {
        target: 'http://instatax-ghost-6cbd2b-82-29-166-148.traefik.me',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/ghost/api/content')
      }
    }
  }
})
