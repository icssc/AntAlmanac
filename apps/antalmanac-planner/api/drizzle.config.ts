import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

import { defineConfig } from 'drizzle-kit';

const here = dirname(fileURLToPath(import.meta.url));

// Do not override variables already in the environment. A package-local .env wins over the app file.
for (const path of [resolve(here, '.env'), resolve(here, '../../antalmanac/.env')]) {
    if (!existsSync(path)) continue;
    for (const [key, value] of Object.entries(parseEnv(readFileSync(path, 'utf8')))) {
        if (process.env[key] === undefined) process.env[key] = value;
    }
}

export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.PLANNER_DATABASE_URL!,
    },
});
