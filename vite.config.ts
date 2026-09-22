import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env': {},
    global: 'globalThis',
    'import.meta.env.VITE_CONTRACT_ID': JSON.stringify(process.env.VITE_CONTRACT_ID || ''),
    'import.meta.env.VITE_USDC_CONTRACT': JSON.stringify(process.env.VITE_USDC_CONTRACT || ''),
  },
})
