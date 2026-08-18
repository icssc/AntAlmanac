import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import { createJiti } from 'jiti';

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '.env') });

// Deferred import after dotenv; drizzle-kit bundles config as CJS, so `await import()` is unavailable.
const { env } = createJiti(import.meta.url)('./src/env.ts');

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/schema/index.ts',
    out: './migrations',
    dbCredentials: {
        url: env.DB_URL,
    },
});
