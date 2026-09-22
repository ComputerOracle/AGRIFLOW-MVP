import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Proxies /api to the backend container-side, so the browser only ever
    // talks to the frontend's own (already-forwarded/authenticated) origin.
    // Avoids cross-origin requests to a separately-forwarded backend port
    // entirely — which is what breaks under Codespaces' private-port auth
    // tunnel (CORS preflight gets redirected to the tunnel's sign-in page
    // and fails with net::ERR_FAILED before the backend ever sees it).
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
