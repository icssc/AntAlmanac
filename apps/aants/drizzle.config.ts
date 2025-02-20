import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: './.env' });

export default defineConfig({
    dialect: 'postgresql',
    schema: '../../backend/src/db/schema/index.ts',
    out: './drizzle',
    dbCredentials: {
        url: process.env.DB_URL || '',
    },
});
