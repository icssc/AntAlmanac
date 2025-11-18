/**
 * To run this script, run "pnpm run migrate".
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

import { client } from '$db/index';

/**
 * Migrates the current drizzle schema to the PostgreSQL database associated
 * with the drizzle client.
 */
export async function migratePostgresDb() {
    await migrate(drizzle(client), {
        migrationsFolder: './drizzle'
    });
}

async function main() {
    try {
        await migratePostgresDb();
    } catch (error) {
        console.log(error);
    } finally {
        await client.end();
    }
}

main();
