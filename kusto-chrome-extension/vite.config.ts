import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import manifest from './src/manifest.json'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const API_PORT = isDev ? 3000 : 3847

  return {
    plugins: [
      react(),
      crx({ manifest }),
    ],
    define: {
      __API_PORT__: JSON.stringify(API_PORT),
    },
    root: 'src',
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]',
        },
      },
    },
  }
})
