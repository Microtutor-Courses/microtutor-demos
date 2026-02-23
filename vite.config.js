import { defineConfig } from 'vite'

export default defineConfig({
  base: '/microtutor-demos/',
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: './src/wave-interference.js',
      output: {
        entryFileNames: 'wave-interference.js',
        format: 'iife',
        name: 'WaveInterference',
      }
    }
  }
})