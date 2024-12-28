/**
 * To run this script, run "pnpm run ddb-rds".
 */

import { ddbClient } from '../src/db/ddb';
import { db, client } from '../src/db/index';
import { RDS } from '../src/lib/rds';
import { mangleDupliateScheduleNames } from '../src/lib/formatting';


/**
 * Migrates user data from DynamoDB to the PostgreSQL database associated
 * with the drizzle client.
 * 
 * NOTE: This pipelines the user data from Postgres, and we might get backed up
 * if DynamoDB returns a lot faster than we can push to Postgres.
 */
async function copyUsersToPostgres() {
    const failedUsers: string[] = [];
    const skippedUsers: string[] = [];

    let success = 0;

    for await (const ddbBatch of ddbClient.getAllUserDataBatches()) {
        console.log(`Copying ${ddbBatch.length} users...`);
        let batchSuccess = 0;
        let batchSkipped = 0;
        const start = Date.now();
        const transactions = ddbBatch.map( // One transaction per user
            async (ddbUser) => {
                // Mangle duplicate schedule names
                ddbUser.userData.schedules = mangleDupliateScheduleNames(ddbUser.userData.schedules);

                return RDS
                    .insertGuestUserData(db, ddbUser)
                    .then((res) => {
                        if (res === null) {
                            skippedUsers.push(ddbUser.id);
                            ++batchSkipped;
                        } else {
                            ++batchSuccess;
                        }
                    })
                    .catch((error) => {
                        failedUsers.push(ddbUser.id);
                        console.error(
                            `Failed to insert user data for "${ddbUser.id}":`
                        );
                        console.error(error);
                    })
            }
        );

        await Promise.all(transactions);
        
        const timeTaken = Date.now() - start;
        const msPerUser = timeTaken / ddbBatch.length;

        console.log(`Successfully copied ${batchSuccess} users out of ${ddbBatch.length} in batch (${batchSkipped} skipped) in ${timeTaken} seconds (${msPerUser}ms/user).`);
        success += batchSuccess;
    }

    console.log(`Successfully copied ${success} users out of ${success + skippedUsers.length + failedUsers.length} (${skippedUsers.length} skipped).`);
    if (failedUsers.length > 0) {
        console.log(`Failed users: ${failedUsers.join(', ')}`);
    }
    if (skippedUsers.length > 0) {
        console.log(`Skipped users: ${skippedUsers.join(', ')}`);
    }
}

async function main() {
    try {
        await copyUsersToPostgres();
    } catch (error) {
        console.log(error);
    } finally {
        await client.end();
    }
}

main();
