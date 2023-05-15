import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'
import path from 'path'

import packageJson from "./package.json";

const dependencies = Object.keys({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
});

const noExternal = process.env.NODE_ENV === "production" ? dependencies : []

export default defineConfig({
    plugins: [
        ...VitePluginNode({
            appPath: path.resolve(__dirname, './src/index.ts'),
            adapter: 'express',
            exportName: 'app',
        }),
    ],
    server: {
        port: 3000
    },
    resolve: {
        alias: {
            $aa: path.resolve(__dirname, '../antalmanac/*'),
            $db: path.resolve(__dirname, './src/db'),
            $models: path.resolve(__dirname, './src/models')
        },
    },
    // ssr: {
    //     noExternal
    // },
})
