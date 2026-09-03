import { defineConfig } from 'vite';

// Cible esnext : nécessaire pour le top-level await utilisé par
// `await renderer.init()` (initialisation asynchrone du WebGPURenderer).
export default defineConfig({
  build: {
    target: 'esnext',
  },
});
