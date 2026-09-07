import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  css: {
    // Tailwind v4 usa LightningCSS internamente, y Vite 8 (Rolldown) también
    // usa LightningCSS como transformer por defecto con distinta configuración.
    // Ese conflicto descarta las variantes responsive (md:, lg:, hover:), por lo
    // que la app se ve "amontonada". Forzamos PostCSS para el CSS de entrada.
    transformer: 'postcss',
  },
  build: {
    // Mismo motivo: evitar que LightningCSS de Vite pise el CSS generado por Tailwind.
    cssMinify: 'esbuild',
  },
  server: {
    watch: {
      // Evita el "punto ciego" de Chokidar en Windows (deja de rastrear archivos
      // y Tailwind deja de generar CSS para componentes). El polling es más lento
      // pero fiable en Windows/WSL y en carpetas en red o montadas.
      usePolling: true,
    },
  },
})
