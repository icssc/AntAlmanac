import { resolve }  from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '$actions': resolve(__dirname, './src/actions'),
      '$api': resolve(__dirname, './src/api'),
      '$components': resolve(__dirname, './src/components'),
      '$lib': resolve(__dirname, './src/lib'),
      '$stores': resolve(__dirname, './src/stores'),
    }
  },
  build: {
    outDir: 'build'
  }
})
