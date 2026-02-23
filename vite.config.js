import { defineConfig } from 'vite'

const components = {
  'wave-interference': './src/wave-interference.js',
  'image-pixel-slider': './src/image-pixel-slider.js',
}

const names = {
  'wave-interference': 'WaveInterference',
  'image-pixel-slider': 'ImagePixelSlider',
}

const target = process.env.COMPONENT

export default defineConfig({
  base: '/microtutor-demos/',
  build: {
    emptyOutDir: false,
    outDir: 'dist',
    rollupOptions: {
      input: components[target],
      output: {
        entryFileNames: `${target}.js`,
        format: 'iife',
        name: names[target],
      }
    }
  }
})