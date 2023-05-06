import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'
import path from 'path'

export default defineConfig({
    plugins: [
        ...VitePluginNode({
            appPath: path.resolve(__dirname, './src/index.ts'),
            adapter: 'express',
        }),
    ],
    resolve: {
        alias: {
            $db: path.resolve(__dirname, './src/db'),
            $models: path.resolve(__dirname, './src/models')
        },
    },
})
