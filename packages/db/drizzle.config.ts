import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '.env') });

const dbUrl = process.env.DB_URL;
if (!dbUrl) {
    throw new Error('DB_URL is required. Set it in packages/db/.env');
}

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/schema/index.ts',
    out: './migrations',
    dbCredentials: {
        url: dbUrl,
    },
});
