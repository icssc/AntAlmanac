import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      $components: resolve(__dirname, 'src/components'),
      $hooks: resolve(__dirname, 'src/hooks'),
      $lib: resolve(__dirname, 'src/lib'),
      $providers: resolve(__dirname, 'src/providers'),
      $routes: resolve(__dirname, 'src/routes'),
      $stores: resolve(__dirname, 'src/stores'),
      $types: resolve(__dirname, 'src/types'),
    },
  },
  build: {
    outDir: 'build',
  },
})
