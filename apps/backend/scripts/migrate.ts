/**
 * To run this script, run "pnpm run migrate".
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

import { ddbClient } from '../src/db/ddb.ts';
import { db, client } from '../src/db/index.ts'; 
import { accounts, users } from '../src/db/schema/index.ts';

/**
 * Migrates the current drizzle schema to the PostgreSQL database associated
 * with the drizzle client. Before migrating, run "pnpm run generate" to generate
 * the migration files, and make sure the PostgreSQL database exists beforehand.
 */
async function migratePostgresDb() {
    await migrate(drizzle(client), {
        migrationsFolder: './drizzle'
    });
}

/**
 * Migrates user data from DynamoDB to the PostgreSQL database associated
 * with the drizzle client.
 */
async function copyUsersToPostgres() {
    for await (const ddbBatch of ddbClient.getAllUserDataBatches()) {
        // To insert 
        const numUsers = ddbBatch.length;
        const emptyArray = new Array(numUsers).fill({});

        const newUsersIds = (
            await db
            .insert(users)
            .values(emptyArray)
            .returning({ userId: users.id})
        ).map((user) => user.userId);
        
        // Make guest accounts for every user
        db
            .insert(accounts)
            .values(newUsersIds.map(
                (userId, index) => (
                    { userId, providerAccountId: ddbBatch[index].name }
                )
            ))
            // If someone changed their account information during the migration,
            // don't overwrite it.
            .onConflictDoNothing({ target: accounts.providerAccountId});

        return newUsersIds;
    }
}

async function main() {
    try {
        await migratePostgresDb();
        await copyUsersToPostgres();
        // TODO: copy other tables
    } catch (error) {
        console.log(error);
    } finally {
        await client.end();
    }
}

main();
