/**
 * To run this script, run "pnpm run migrate".
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

import { ddbClient } from '../src/db/ddb.ts';
import { db, client } from '../src/db/index.ts';
import { RDS } from '../src/lib/rds.ts';

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
 * 
 * NOTE: This pipelines the user data from Postgres, and we might get backed up
 * if DynamoDB returns a lot faster than we can push to Postgres.
 */
async function copyUsersToPostgres() {
    const transactionBatches: Promise<void[]>[] = [];
    const failedUsers: string[] = [];

    let success = 0;

    for await (const ddbBatch of ddbClient.getAllUserDataBatches()) {
        const transactions = ddbBatch.map( // One transaction per user
            (ddbUser) => RDS
                .upsertGuestUserData(db, ddbUser)
                .catch((error) => {
                    failedUsers.push(ddbUser.id);
                    console.error(
                        `Failed to upsert user data for ${ddbUser.id}:`, error
                    );
                })
                .then((data) => { 
                    if (data) 
                        console.log(
                        `Successfully copied user ${data}. (${++success})`
                    );   
                })
        );

        transactionBatches.push(Promise.all(transactions));
    }

    await Promise.all(transactionBatches);

    if (failedUsers.length > 0) {
        console.log(`Successfully copied ${success} users out of ${success + failedUsers.length}.`);
        console.log(`Failed users: ${failedUsers.join(', ')}`);
    }

}

async function main() {
    try {
        await migratePostgresDb();
        await copyUsersToPostgres();
        
    } catch (error) {
        console.log(error);
    } finally {
        await client.end();
    }
}

main();
