/**
 * To run this script, run "pnpm run migrate".
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import 'dotenv/config';

/**
 * Migrates the current drizzle schema to the PostgreSQL database associated
 * with the drizzle client.
 */
export async function migratePostgresDb() {
    const dbUrl = process.env.DB_URL;
    if (!dbUrl) {
        throw new Error('DB_URL is required for migrations');
    }
    
    const client = postgres(dbUrl);
    
    await migrate(drizzle(client), {
        migrationsFolder: './drizzle'
    });
    
    return client;
}

async function main() {
    let client;
    try {
        client = await migratePostgresDb();
        console.log('✅ Migration completed successfully');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        if (client) {
            await client.end();
        }
    }
}

main();
