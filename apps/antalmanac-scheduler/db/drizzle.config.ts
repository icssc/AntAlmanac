import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import { createJiti } from 'jiti';

const here = dirname(fileURLToPath(import.meta.url));
// Package .env wins. The app .env is the fallback the setup wizard writes.
config({ path: resolve(here, '.env') });
config({ path: resolve(here, '../../antalmanac/.env') });

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
