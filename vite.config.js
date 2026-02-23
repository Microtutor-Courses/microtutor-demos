import { defineConfig } from 'vite'

const components = {
  'wave-interference': './src/wave-interference.js',
  'image-pixel-slider': './src/image-pixel-slider.js',
  'snr-demo': './src/snr-demo.js',
  'spherical-aberration': './src/spherical-aberration.js',
  'poisson-snr': './src/poisson-snr.js',
}

const names = {
  'wave-interference': 'WaveInterference',
  'image-pixel-slider': 'ImagePixelSlider',
  'snr-demo': 'SNRDemo',
  'spherical-aberration': 'SphericalAberration',
  'poisson-snr': 'PoissonSNR',
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