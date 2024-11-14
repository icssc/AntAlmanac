/**
 * To run this script, run "pnpm run migrate".
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

import { ddbClient } from '../src/db/ddb.ts';
import { db, client } from '../src/db/index.ts';
import { RDS } from '../src/lib/rds.ts';
import { mangleDupliateScheduleNames } from '../src/lib/formatting.ts';

/**
 * Migrates the current drizzle schema to the PostgreSQL database associated
 * with the drizzle client. Before migrating, run "pnpm run generate" to generate
 * the migration files, and make sure the PostgreSQL database exists beforehand.
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
