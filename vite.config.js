import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Cambiado a '/' para que el enrutamiento y las recargas funcionen en vercel/rutas profundas
})