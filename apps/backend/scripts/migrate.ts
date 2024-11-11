/**
 * To run this script, run "pnpm run migrate".
 */

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

import { ShortCourseSchedule } from '@packages/antalmanac-types';

import { ddbClient } from '$db/ddb';
import { db, client } from '$db/index';
import { accounts, users, schedules, coursesInSchedule } from '$db/schema';
import {notNull} from "$aa/src/lib/utils";

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

function ddbToPostgresSchedules(
    userId: string,
    ddbSchedules: ShortCourseSchedule[]
): typeof schedules.$inferInsert[] {
    return ddbSchedules.map(
        (ddbSchedule) => ({
            userId,
            name: ddbSchedule.scheduleName,
            notes: ddbSchedule.scheduleNote,
        })
    );
}

function ddbToPostgresCourse(
    ddbSchedules: ShortCourseSchedule[],
    scheduleIds: string[],
): typeof coursesInSchedule.$inferInsert[] {
    return ddbSchedules.map(
        (ddbSchedule, index) => (
            ddbSchedule.courses.map(
                (ddbCourse) => ({
                    scheduleId: scheduleIds[index],
                    term: ddbCourse.term,
                    sectionCode: parseInt(ddbCourse.sectionCode),
                    color: ddbCourse.color,
                })
            )
        )
    ).flat();
}

/**
 * Migrates user data from DynamoDB to the PostgreSQL database associated
 * with the drizzle client.
 */
async function copyUsersToPostgres() {
    const transactionBatches: Promise<void[]>[] = [];
    const failedUsers: string[] = [];

    for await (const ddbBatch of ddbClient.getAllUserDataBatches()) {
        const transactions = ddbBatch.filter(notNull).map( // One transaction per user
            (ddbUser) => db.transaction(
                async (tx) => {
                    // Create user with name. 
                    // This overwrites the user, but that doesn't matter because
                    // the only thing that's changed is the current schedule index. 
                    const userId = (await (
                        tx
                        .insert(users)
                        .values({ name: ddbUser.name, })
                        .returning({ id: users.id })
                    )).map((user) => user.id)[0];
                    
                    // Add as guest account
                    await (
                        tx
                        .insert(accounts)
                        .values({ userId, providerAccountId: ddbUser.id })
                    );

                    // Add schedules/courses

                    // Add schedules
                    const scheduleIds = (
                        await (
                            tx
                            .insert(schedules)
                            .values(
                                ddbToPostgresSchedules(
                                    ddbUser.id,
                                    ddbUser.userData.schedules
                                )
                            )
                            .returning({ id: schedules.id })
                        )
                    ).map((schedule) => schedule.id);

                    // Update user's current schedule
                    const currentScheduleId = scheduleIds[ddbUser.userData.scheduleIndex];
                    await (
                        tx
                        .update(users)
                        .set({ currentScheduleId: currentScheduleId })
                        .where(eq(users.id, userId))
                    )

                    // Add courses
                    await (
                        tx
                        .insert(coursesInSchedule)
                        .values(
                            ddbToPostgresCourse(
                                ddbUser.userData.schedules,
                                scheduleIds
                            )
                        )
                    )
                }
            ).catch((error) => {
                failedUsers.push(ddbUser.id);
                console.log(error);
            })
        );

        transactionBatches.push(Promise.all(transactions));
    }
    
    return Promise.all(transactionBatches);
}

async function main() {
    try {
        await migratePostgresDb();
        if (process.env.COPY_TO_POSTGRES) await copyUsersToPostgres();
    } catch (error) {
        console.log(error);
    } finally {
        await client.end();
    }
}

main();
