/**
 * To run this script, run "pnpm run ddb-rds".
 */

import { ddbClient } from '../src/db/ddb';
import { db, client } from '../src/db/index';
import { RDS } from '../src/lib/rds';
import { mangleDupliateScheduleNames } from '../src/lib/formatting';
import { migratePostgresDb } from './migrate';


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
            async (ddbUser) => {
                // Mangle duplicate schedule names
                ddbUser.userData.schedules = mangleDupliateScheduleNames(ddbUser.userData.schedules);

                return RDS
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
                    }
                );
            }
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
