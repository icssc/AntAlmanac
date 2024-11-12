import { ShortCourseSchedule, User } from '@packages/antalmanac-types';

import { and, asc, eq } from 'drizzle-orm';
import type { Database } from "$db/index";
import { schedules, users, accounts, coursesInSchedule } from '$db/schema';


export class RDS {
    /**
     * Creates a guest user if they don't already exist. 
     * 
     * @param db Database or transaction object
     * @param name Guest user's name, to be used as providerAccountID and username
     * @returns The new/existing user's ID
     */
    static async createGuestUserOptional(db: Database, name: string) {
        return db.transaction(async (tx) => {
            const guestAccountsWithSameName = await tx
                .select()
                .from(accounts)
                .where(and(
                    eq(accounts.accountType, "GUEST"),
                    eq(accounts.providerAccountId, name)
                ));

            if (guestAccountsWithSameName.length > 0) {
                return guestAccountsWithSameName[0].userId;
            }

            return (await (
                tx
                .insert(users)
                .values({ name })
                .returning({ id: users.id })
            )).map((user) => user.id)[0];
        });
    }

    static async upsertScheduleAndCourses(db: Database, userId: string, schedule: ShortCourseSchedule) {
        // Add schedule
        const dbSchedule = {
            userId, 
            name: schedule.scheduleName, 
            notes: schedule.scheduleNote, 
            lastUpdated: new Date()
        }
        
        const scheduleResult = await db.transaction(
            async (tx) => (
                tx.insert(schedules)
                    .values(dbSchedule)
                    .onConflictDoUpdate({ 
                        target: [schedules.userId, schedules.name], 
                        set: dbSchedule 
                    })
                    .returning({id: schedules.id})
            )
        );

        const scheduleId = scheduleResult[0].id;
        if (scheduleId === undefined) {
            throw new Error(`Failed to insert schedule for ${userId}`);
        }

        // Drop all courses in the schedule and re-add them

        await db.transaction(async (tx) => await tx
            .delete(coursesInSchedule)
            .where(eq(coursesInSchedule.scheduleId, scheduleId))
        );

        const dbCourses = schedule.courses.map((course) => ({
            scheduleId,
            sectionCode: parseInt(course.sectionCode),
            term: course.term,
            color: course.color,
            lastUpdated: new Date()
        }));

        await db.transaction(async (tx) => await tx
            .insert(coursesInSchedule)
            .values(dbCourses)
        );

        return scheduleId;
    }

    /**
     * Creates a guest user with the username in the userData object if one
     * with the same name doesn't already exist.
     * 
     * If the user already exists, their schedules and courses are updated.
     * 
     * @param db The Drizzle client or transaction object
     * @param userData The object of data containing the user's schedules and courses
     * @returns The user's ID
     */
    static async upsertGuestUserData(
        db: Database, userData: User
    ): Promise<string> {
        return db.transaction(async (tx) => {
            const userId = await this.createGuestUserOptional(tx, userData.id);
            
            if (userId === undefined) {
                throw new Error(`Failed to create guest user for ${userData.id}`);
            }

            // Add schedules and courses
            const schedulesPromises = userData.userData.schedules.map(
                (schedule) => this.upsertScheduleAndCourses(tx, userId, schedule)
            )

            const scheduleIds = await Promise.all(schedulesPromises);
            
            // Update user's current schedule index
            const currentScheduleId = scheduleIds[userData.userData.scheduleIndex];
            await tx
                .update(users)
                .set({ currentScheduleId: currentScheduleId })
                .where(eq(users.id, userId));

            return userId;
        })
    }
}
