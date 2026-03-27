import { defineConfig } from 'vite'

const components = {
  'wave-interference': './src/wave-interference.js',
  'image-pixel-slider': './src/image-pixel-slider.js',
  'snr-demo': './src/snr-demo.js',
  'spherical-aberration': './src/spherical-aberration.js',
  'poisson-snr': './src/poisson-snr.js',
  'digital-image-demo': './src/digital-image-demo.js',
  'spherical-aberration-ray-demo': './src/spherical-aberration-ray-demo.js',
  'micro-viewer-3d': './src/micro-viewer-3d.js',
  'background-demo': './src/background-demo.js',
  'zstack-demo': './src/zstack-demo.js',
}

const names = {
  'wave-interference': 'WaveInterference',
  'image-pixel-slider': 'ImagePixelSlider',
  'snr-demo': 'SNRDemo',
  'spherical-aberration': 'SphericalAberration',
  'poisson-snr': 'PoissonSNR',
  'digital-image-demo': 'DigitalImageDemo',
  'spherical-aberration-ray-demo': 'SphericalAberrationRayDemo',
  'micro-viewer-3d': 'MicroViewer3D',
  'background-demo': 'BackgroundDemo',
  'zstack-demo': 'ZStackDemo',
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