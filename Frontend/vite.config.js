import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      'smirkingly-nonspalling-awilda.ngrok-free.dev'
    ],
    host: true,
    port: 3000,
    // Optional: Add proxy if needed (not required with CORS enabled)
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:7070',
    //     changeOrigin: true,
    //     secure: false,
    //   }
    // }
  }
})
