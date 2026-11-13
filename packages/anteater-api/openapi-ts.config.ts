import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: 'https://anteaterapi.com/openapi.json',
    output: 'src/types/generated/anteater-api-types',
    plugins: ['@hey-api/client-next'],
});
