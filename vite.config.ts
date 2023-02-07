import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '$lib': 'src/lib',
            '$components': 'src/components',
        }
    }
});
