import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const components = {
  interference: './src/interference.jsx',
  pixel: './src/pixel.jsx',
  snr: './src/snr.jsx',
}

const target = process.env.COMPONENT

export default defineConfig({
  base: '/microtutor-demos/',
  plugins: [react(), tailwindcss()],
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: components[target],
      output: {
        entryFileNames: `${target}.js`,
        format: 'iife',
        name: target,
      }
    }
  }
})