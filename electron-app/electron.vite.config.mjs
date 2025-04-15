import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/main', 
    rollupOptions: {
        input: 'src/main/index.js', 
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/preload', // Match Electron's expected output directory
      rollupOptions: {
        input: 'src/preload/index.js' // Explicit preload entry point
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    base: './', 
    plugins: [react()]
  },

})
