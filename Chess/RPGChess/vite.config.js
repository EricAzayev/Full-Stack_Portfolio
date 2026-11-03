import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/projects/rpg-chess/',
  server: {
    proxy: {
      '/armories': 'http://localhost:3002',
      '/users': 'http://localhost:3002'
    }
  },
  plugins: [react()],
})