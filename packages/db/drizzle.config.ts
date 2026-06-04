import { defineConfig } from 'drizzle-kit';

import { env } from './src/env';

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/schema/index.ts',
    out: './migrations',
    dbCredentials: {
        url: env.DB_URL,
    },
});
