import { defineConfig } from 'drizzle-kit';
import { env } from 'src/env';

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/db/schema/index.ts',
    out: './drizzle',
    dbCredentials: {
        url: env.DB_URL,
    },
});
