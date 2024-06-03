/**
 * To run this script, run "pnpm run migrate".
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

import { ddbClient } from '../src/db/ddb.ts';
import { db, client } from '../src/db/index.ts'; 
import { user } from '../src/db/schema/index.ts';

/**
 * Migrates the current drizzle schema to the PostgreSQL database associated
 * with the drizzle client. Before migrating, run "pnpm run generate" to generate
 * the migration files, and make sure the PostgreSQL database exists beforehand.
 */
async function migrateToPostgres() {
    await migrate(drizzle(client), {
        migrationsFolder: './drizzle'
    });
}

/**
 * Migrates user data from DynamoDB to the PostgreSQL database associated
 * with the drizzle client.
 */
async function insertUsersToPostgres() {
    const userIds = await ddbClient.getUserIds();
    const usersToInsert = userIds.map((userId) => ({ id: userId }));
    await db.insert(user).values(usersToInsert);
    console.log(await db.query.user.findMany());
}

async function main() {
    try {
        await migrateToPostgres();
        await insertUsersToPostgres();
    } catch (error) {
        console.log(error);
    } finally {
        await client.end();
    }
}

main();
