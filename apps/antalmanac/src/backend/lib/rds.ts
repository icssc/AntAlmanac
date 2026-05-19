import type {
    ShortCourse,
    ShortCourseSchedule,
    RepeatingCustomEvent,
    Notification,
    ScheduleSaveState,
} from '@packages/antalmanac-types';
import { VISIBILITY_STATES, VisibilityState } from '@packages/antalmanac-types';
import type { Quarter, Year } from '@packages/anteater-api/types';
import type { db } from '@packages/db';
import type * as schema from '@packages/db/src/schema';
import {
    schedules,
    users,
    accounts,
    coursesInSchedule,
    customEvents,
    type Schedule,
    type CourseInSchedule,
    type CustomEvent,
    sessions,
    Account,
    friendships,
    subscriptions,
    User,
} from '@packages/db/src/schema';
import {
    buildConflictUpdateSet,
    buildConflictUpdateWhereChanged,
    type ConflictUpdatePolicy,
} from '@packages/db/src/utils';
import { createId } from '@paralleldrive/cuid2';
import { and, eq, ExtractTablesWithRelations, gt, ne, or, not, notInArray, sql } from 'drizzle-orm';
import type { PgTransaction, PgQueryResultHKT } from 'drizzle-orm/pg-core';

type Transaction = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
type DatabaseOrTransaction = Omit<typeof db, '$client'> | Transaction;

// biome-ignore lint/complexity/noStaticOnlyClass: todo
export class RDS {
    /**
     * Retrieves an account with the specified user ID and account type.
     *
     * @param db - The database or transaction object.
     * @param userId - The ID of the user whose account is to be retrieved.
     * @returns A promise that resolves to the account object if found, otherwise null.
     */
    static async getAccountByProviderAccountId(
        db: DatabaseOrTransaction,
        accountType: Account['accountType'],
        providerAccountId: string
    ): Promise<Account | null> {
        return db
            .select()
            .from(accounts)
            .where(and(eq(accounts.accountType, accountType), eq(accounts.providerAccountId, providerAccountId)))
            .limit(1)
            .then((res) => res[0] ?? null);
    }

    static async getUserByEmail(db: DatabaseOrTransaction, email: string) {
        return db
            .select()
            .from(users)
            .where(sql`lower(${users.email}) = lower(${email.trim()})`)
            .limit(1)
            .then((res) => res[0]);
    }

    /**
     * Upserts the given user's schedules and selected schedule index.
     *
     * @param db The Drizzle client or transaction object
     * @param userId The internal user ID whose data is being saved
     * @param saveState The schedules and selected index to persist
     */
    static async upsertUserData(
        db: DatabaseOrTransaction,
        userId: string,
        saveState: ScheduleSaveState
    ): Promise<{ userId: string; scheduleIdMap: Record<string, string> }> {
        return db.transaction(async (tx) => {
            const scheduleIdMap = await this.upsertSchedulesAndContents(tx, userId, saveState.schedules);

            const scheduleDbIds = Object.values(scheduleIdMap);
            const scheduleIndex = saveState.scheduleIndex;
            const currentScheduleId =
                scheduleIndex === undefined || scheduleIndex >= scheduleDbIds.length
                    ? null
                    : scheduleDbIds[scheduleIndex];

            if (currentScheduleId !== null) {
                await tx.update(users).set({ currentScheduleId }).where(eq(users.id, userId));
            }

            return { userId, scheduleIdMap };
        });
    }

    private static async upsertSchedulesAndContents(
        tx: Transaction,
        userId: string,
        scheduleArray: ShortCourseSchedule[]
    ): Promise<Record<string, string>> {
        const existingRows = await tx
            .select({ id: schedules.id, sharedWithFriends: schedules.sharedWithFriends })
            .from(schedules)
            .where(eq(schedules.userId, userId));
        const existingIds = new Set(existingRows.map((s) => s.id));
        const existingSharingStatuses = new Map(existingRows.map((s) => [s.id, s.sharedWithFriends]));

        const prepared = scheduleArray.map((schedule, index) => ({
            schedule,
            index,
            dbId: schedule.id && existingIds.has(schedule.id) ? schedule.id : createId(),
        }));

        const keepIds = prepared.map((p) => p.dbId);
        await tx
            .delete(schedules)
            .where(
                keepIds.length === 0
                    ? eq(schedules.userId, userId)
                    : and(eq(schedules.userId, userId), notInArray(schedules.id, keepIds))
            );

        if (prepared.length > 0) {
            const scheduleUpdatePolicy = {
                id: 'keep',
                userId: 'keep',
                name: 'update',
                notes: 'update',
                index: 'update',
                createdAt: 'keep',
                lastUpdated: 'update',
                sharedWithFriends: 'keep', // sharedWithFriends is not updated by upsertCourses or upsertCustomEvents
            } satisfies ConflictUpdatePolicy<typeof schedules>;

            await tx
                .insert(schedules)
                .values(
                    prepared.map(({ schedule, index, dbId }) => ({
                        id: dbId,
                        userId,
                        name: schedule.scheduleName,
                        notes: schedule.scheduleNote,
                        index,
                        sharedWithFriends: existingSharingStatuses.get(dbId) ?? true,
                    }))
                )
                .onConflictDoUpdate({
                    target: schedules.id,
                    set: buildConflictUpdateSet(schedules, scheduleUpdatePolicy),
                    where: buildConflictUpdateWhereChanged(schedules, scheduleUpdatePolicy, ['lastUpdated']),
                });
        }

        await Promise.all(
            prepared.flatMap(({ schedule, dbId }) => [
                this.upsertCourses(tx, dbId, schedule.courses).catch((error) => {
                    throw new Error(`Failed to upsert courses for ${schedule.scheduleName}: ${error}`);
                }),
                this.upsertCustomEvents(tx, dbId, schedule.customEvents).catch((error) => {
                    throw new Error(`Failed to upsert custom events for ${schedule.scheduleName}: ${error}`);
                }),
            ])
        );

        const scheduleIdMap: Record<string, string> = {};
        for (const { schedule, dbId } of prepared) {
            if (schedule.id !== undefined) {
                scheduleIdMap[schedule.id] = dbId;
            }
        }

        return scheduleIdMap;
    }

    private static async upsertCourses(tx: Transaction, scheduleId: string, courses: ShortCourse[]) {
        const uniqueByKey = new Map<string, { sectionCode: number; term: string; color: string; visibility: string }>();
        for (const course of courses) {
            const sectionCode = parseInt(course.sectionCode);
            const key = `${sectionCode}-${course.term}`;
            if (!uniqueByKey.has(key)) {
                uniqueByKey.set(key, {
                    sectionCode,
                    term: course.term,
                    color: course.color,
                    visibility: course.visibility ?? VisibilityState.Visible,
                });
            }
        }
        const incoming = [...uniqueByKey.values()];

        const incomingCourses = incoming.map((course) =>
            and(eq(coursesInSchedule.sectionCode, course.sectionCode), eq(coursesInSchedule.term, course.term))
        );

        await tx
            .delete(coursesInSchedule)
            .where(
                incomingCourses.length === 0
                    ? eq(coursesInSchedule.scheduleId, scheduleId)
                    : and(eq(coursesInSchedule.scheduleId, scheduleId), not(or(...incomingCourses)!))
            );

        if (incoming.length === 0) {
            return;
        }

        const courseUpdatePolicy = {
            scheduleId: 'keep',
            sectionCode: 'keep',
            term: 'keep',
            color: 'update',
            visibility: 'update',
            index: 'update',
            createdAt: 'keep',
            lastUpdated: 'update',
        } satisfies ConflictUpdatePolicy<typeof coursesInSchedule>;

        await tx
            .insert(coursesInSchedule)
            .values(incoming.map((course, index) => ({ scheduleId, ...course, index })))
            .onConflictDoUpdate({
                target: [coursesInSchedule.scheduleId, coursesInSchedule.sectionCode, coursesInSchedule.term],
                set: buildConflictUpdateSet(coursesInSchedule, courseUpdatePolicy),
                where: buildConflictUpdateWhereChanged(coursesInSchedule, courseUpdatePolicy, ['lastUpdated']),
            });
    }

    private static async upsertCustomEvents(
        tx: Transaction,
        scheduleId: string,
        repeatingCustomEvents: RepeatingCustomEvent[]
    ) {
        const incomingIds = repeatingCustomEvents.map((event) => String(event.customEventID));

        await tx
            .delete(customEvents)
            .where(
                incomingIds.length === 0
                    ? eq(customEvents.scheduleId, scheduleId)
                    : and(eq(customEvents.scheduleId, scheduleId), notInArray(customEvents.id, incomingIds))
            );

        if (repeatingCustomEvents.length === 0) {
            return;
        }

        const customEventUpdatePolicy = {
            id: 'keep',
            scheduleId: 'keep',
            title: 'update',
            start: 'update',
            end: 'update',
            days: 'update',
            color: 'update',
            building: 'update',
            createdAt: 'keep',
            lastUpdated: 'update',
        } satisfies ConflictUpdatePolicy<typeof customEvents>;

        await tx
            .insert(customEvents)
            .values(
                repeatingCustomEvents.map((event) => ({
                    id: String(event.customEventID),
                    scheduleId,
                    title: event.title,
                    start: event.start,
                    end: event.end,
                    days: event.days.map((day) => (day ? '1' : '0')).join(''),
                    color: event.color,
                    building: event.building,
                }))
            )
            .onConflictDoUpdate({
                target: [customEvents.scheduleId, customEvents.id],
                set: buildConflictUpdateSet(customEvents, customEventUpdatePolicy),
                where: buildConflictUpdateWhereChanged(customEvents, customEventUpdatePolicy, ['lastUpdated']),
            });
    }

    /**
     * Retrieves a schedule by its ID. All schedules are publicly accessible via their ID.
     *
     * @param db - The database or transaction object to use for the query.
     * @param scheduleId - The unique identifier of the schedule.
     * @returns A promise that resolves to a ShortCourseSchedule object, or null if the schedule is not found.
     */
    static async getScheduleById(
        db: DatabaseOrTransaction,
        scheduleId: string
    ): Promise<(ShortCourseSchedule & { id: string; index: number; userId: string }) | null> {
        return db.transaction(async (tx) => {
            const schedule = await tx
                .select()
                .from(schedules)
                .where(eq(schedules.id, scheduleId))
                .then((res) => res[0]);

            if (!schedule) {
                return null;
            }

            const sectionResults = await tx
                .select()
                .from(schedules)
                .where(eq(schedules.id, scheduleId))
                .leftJoin(coursesInSchedule, eq(schedules.id, coursesInSchedule.scheduleId));

            const customEventResults = await tx
                .select()
                .from(schedules)
                .where(eq(schedules.id, scheduleId))
                .leftJoin(customEvents, eq(schedules.id, customEvents.scheduleId));

            const scheduleArray = RDS.aggregateUserData(sectionResults, customEventResults);
            const result = scheduleArray[0];
            if (!result) return null;
            return { ...result, userId: schedule.userId };
        });
    }

    /**
     * Retrieves a guest user's publicly-shareable schedule data by their
     * guest username.
     */
    static async getGuestScheduleByUsername(
        db: DatabaseOrTransaction,
        username: string
    ): Promise<(User & { userData: ScheduleSaveState }) | null> {
        const row = await db
            .select()
            .from(accounts)
            .innerJoin(users, eq(accounts.userId, users.id))
            .where(and(eq(accounts.accountType, 'GUEST'), eq(accounts.providerAccountId, username)))
            .limit(1)
            .then((res) => res[0] ?? null);

        if (!row) {
            return null;
        }

        const userId = row.users.id;

        const [sectionResults, customEventResults] = await Promise.all([
            db
                .select()
                .from(schedules)
                .where(eq(schedules.userId, userId))
                .leftJoin(coursesInSchedule, eq(schedules.id, coursesInSchedule.scheduleId)),
            db
                .select()
                .from(schedules)
                .where(eq(schedules.userId, userId))
                .leftJoin(customEvents, eq(schedules.id, customEvents.scheduleId)),
        ]);

        const userSchedules = RDS.aggregateUserData(sectionResults, customEventResults);

        const scheduleIndex = row.users.currentScheduleId
            ? userSchedules.findIndex((s) => s.id === row.users.currentScheduleId)
            : userSchedules.length;

        return {
            ...row.users,
            userData: {
                schedules: userSchedules,
                scheduleIndex,
            },
        };
    }

    /**
     * Retrieves a friend's user data, filtered to only schedules they have chosen to share with friends.
     *
     * @param db - The database or transaction object to use for the query.
     * @param userId - The unique identifier of the friend.
     * @returns A promise that resolves to a User object containing only the shared schedules, or null if not found.
     */
    static async getUserFriendDataByUid(
        db: DatabaseOrTransaction,
        userId: string
    ): Promise<(User & { userData: ScheduleSaveState }) | null> {
        return db.transaction(async (tx) => {
            const user = await tx
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .then((res) => res[0]);

            if (!user) {
                return null;
            }

            const sharedCondition = and(eq(schedules.userId, userId), eq(schedules.sharedWithFriends, true));

            const sectionResults = await tx
                .select()
                .from(schedules)
                .where(sharedCondition)
                .leftJoin(coursesInSchedule, eq(schedules.id, coursesInSchedule.scheduleId));

            const customEventResults = await tx
                .select()
                .from(schedules)
                .where(sharedCondition)
                .leftJoin(customEvents, eq(schedules.id, customEvents.scheduleId));

            const userSchedules = RDS.aggregateUserData(sectionResults, customEventResults);

            return {
                ...user,
                userData: {
                    schedules: userSchedules,
                    scheduleIndex: 0,
                },
            };
        });
    }

    /**
     * Aggregates the user's schedule data from the results of two queries.
     */
    private static aggregateUserData(
        sectionResults: { schedules: Schedule; coursesInSchedule: CourseInSchedule | null }[],
        customEventResults: { schedules: Schedule; customEvents: CustomEvent | null }[]
    ): (ShortCourseSchedule & { id: string; index: number })[] {
        // Map from schedule ID to schedule data
        const schedulesMapping: Record<string, ShortCourseSchedule & { id: string; index: number }> = {};

        const courseIndexes: Record<Schedule['id'], Record<ShortCourse['sectionCode'], CourseInSchedule['index']>> = {};

        // Add courses to schedules
        sectionResults.forEach(({ schedules: schedule, coursesInSchedule: course }) => {
            const scheduleId = schedule.id;

            const scheduleAggregate = schedulesMapping[scheduleId] || {
                id: scheduleId,
                scheduleName: schedule.name,
                scheduleNote: schedule.notes,
                courses: [],
                customEvents: [],
                index: schedule.index,
            };

            if (course) {
                const sectionCode = course.sectionCode.toString();
                scheduleAggregate.courses.push({
                    sectionCode: sectionCode,
                    term: course.term,
                    color: course.color,
                    visibility: VISIBILITY_STATES.includes(course.visibility as VisibilityState)
                        ? (course.visibility as VisibilityState)
                        : VisibilityState.Visible,
                });

                if (course.index !== null) {
                    if (!courseIndexes[scheduleId]) {
                        courseIndexes[scheduleId] = {};
                    }
                    courseIndexes[scheduleId][sectionCode] = course.index;
                }
            }

            schedulesMapping[scheduleId] = scheduleAggregate;
        });

        for (const [scheduleId, indexes] of Object.entries(courseIndexes)) {
            schedulesMapping[scheduleId].courses.sort((a, b) => {
                const aIndex = indexes[a.sectionCode];
                const bIndex = indexes[b.sectionCode];
                if (typeof aIndex !== 'number' || typeof bIndex !== 'number') {
                    return 0;
                }
                return aIndex - bIndex;
            });
        }

        // Add custom events to schedules
        customEventResults.forEach(({ schedules: schedule, customEvents: customEvent }) => {
            const scheduleId = schedule.id;
            const scheduleAggregate = schedulesMapping[scheduleId] || {
                scheduleName: schedule.name,
                scheduleNote: schedule.notes,
                courses: [],
                customEvents: [],
            };

            if (customEvent) {
                scheduleAggregate.customEvents.push({
                    customEventID: customEvent.id,
                    title: customEvent.title,
                    start: customEvent.start,
                    end: customEvent.end,
                    days: customEvent.days.split('').map((day) => day === '1'),
                    color: customEvent.color ?? '#551a8b',
                    building: customEvent.building ?? undefined,
                });
            }

            schedulesMapping[scheduleId] = scheduleAggregate;
        });

        // Sort schedules by index
        return Object.values(schedulesMapping).sort((a, b) => a.index - b.index);
    }

    private static async getUserDataWithSession(db: DatabaseOrTransaction, refreshToken: string) {
        return db
            .select()
            .from(users)
            .leftJoin(sessions, eq(users.id, sessions.userId))
            .where(and(eq(sessions.refreshToken, refreshToken), gt(sessions.expires, new Date())))
            .then((res) => res[0].users);
    }

    /**
     * Fetches user data associated with a valid session using a refresh token.
     *
     * Retrieves user information based on the provided refresh token. If a user is
     * found, gathers the user's schedules and custom events, aggregates them, and
     * determines the current schedule index.
     *
     * @param db - The database or transaction object to perform the operation.
     * @param refreshToken - The refresh token used to identify the session.
     * @returns A promise that resolves to an object containing the user's ID and user data,
     *          including schedules and the current schedule index, or null if no user is found.
     */
    static async fetchUserDataWithSession(db: DatabaseOrTransaction, refreshToken: string) {
        const user = await this.getUserDataWithSession(db, refreshToken);

        if (!user) {
            return null;
        }

        const [sectionResults, customEventResults] = await Promise.all([
            db
                .select()
                .from(schedules)
                .where(eq(schedules.userId, user.id))
                .leftJoin(coursesInSchedule, eq(schedules.id, coursesInSchedule.scheduleId)),
            db
                .select()
                .from(schedules)
                .where(eq(schedules.userId, user.id))
                .leftJoin(customEvents, eq(schedules.id, customEvents.scheduleId)),
        ]);

        const userSchedules = RDS.aggregateUserData(sectionResults, customEventResults);

        const scheduleIndex = user.currentScheduleId
            ? userSchedules.findIndex((schedule) => schedule.id === user.currentScheduleId)
            : userSchedules.length;
        return {
            id: user.id,
            userData: {
                schedules: userSchedules,
                scheduleIndex,
            },
        };
    }

    /**
     * Returns all friendship rows between two users regardless of direction.
     * There can be up to two rows (e.g. DECLINED + BLOCKED after a block).
     */
    static async getFriendshipsBetween(db: DatabaseOrTransaction, userIdA: string, userIdB: string) {
        return db
            .select()
            .from(friendships)
            .where(
                or(
                    and(eq(friendships.requesterId, userIdA), eq(friendships.addresseeId, userIdB)),
                    and(eq(friendships.requesterId, userIdB), eq(friendships.addresseeId, userIdA))
                )
            );
    }

    /**
     * Inserts a PENDING friend request from requesterId to addresseeId.
     * Does nothing on conflict — a DECLINED row (blocked sender's preserved card) must not be
     * overwritten back to PENDING by the sender re-requesting.
     */
    static async insertFriendRequest(db: DatabaseOrTransaction, requesterId: string, addresseeId: string) {
        return db
            .insert(friendships)
            .values({ requesterId, addresseeId, status: 'PENDING' })
            .onConflictDoNothing()
            .returning();
    }

    /**
     * Updates a PENDING friendship to ACCEPTED.
     */
    static async acceptFriendRequest(db: DatabaseOrTransaction, requesterId: string, addresseeId: string) {
        return db
            .update(friendships)
            .set({ status: 'ACCEPTED', updatedAt: new Date() })
            .where(
                and(
                    eq(friendships.requesterId, requesterId),
                    eq(friendships.addresseeId, addresseeId),
                    eq(friendships.status, 'PENDING')
                )
            )
            .returning();
    }

    /**
     * Returns accepted friends where the given user sent the request.
     */
    static async getFriendshipsSent(db: DatabaseOrTransaction, userId: string) {
        return db
            .select({ id: users.id, name: users.name, email: users.email, avatar: users.avatar })
            .from(friendships)
            .innerJoin(users, eq(friendships.addresseeId, users.id))
            .where(and(eq(friendships.requesterId, userId), eq(friendships.status, 'ACCEPTED')));
    }

    /**
     * Returns accepted friends where the given user received the request.
     */
    static async getFriendshipsReceived(db: DatabaseOrTransaction, userId: string) {
        return db
            .select({ id: users.id, name: users.name, email: users.email, avatar: users.avatar })
            .from(friendships)
            .innerJoin(users, eq(friendships.requesterId, users.id))
            .where(and(eq(friendships.addresseeId, userId), eq(friendships.status, 'ACCEPTED')));
    }

    /**
     * Returns all accepted friends for the given user as an array of user objects (id, name, email).
     */
    static async getFriends(db: DatabaseOrTransaction, userId: string) {
        const [sent, received] = await Promise.all([
            this.getFriendshipsSent(db, userId),
            this.getFriendshipsReceived(db, userId),
        ]);
        return [...sent, ...received];
    }

    /**
     * Returns true if an ACCEPTED friendship exists between the two users in either direction.
     */
    static async areFriends(db: DatabaseOrTransaction, viewerId: string, targetUserId: string): Promise<boolean> {
        const [row] = await db
            .select({ id: friendships.requesterId })
            .from(friendships)
            .where(
                and(
                    eq(friendships.status, 'ACCEPTED'),
                    or(
                        and(eq(friendships.requesterId, viewerId), eq(friendships.addresseeId, targetUserId)),
                        and(eq(friendships.requesterId, targetUserId), eq(friendships.addresseeId, viewerId))
                    )
                )
            )
            .limit(1);
        return Boolean(row);
    }

    /**
     * Returns all pending friend requests received by the given user (id, name, email of requester).
     */
    static async getPendingFriendRequests(db: DatabaseOrTransaction, userId: string) {
        return db
            .select({ id: users.id, name: users.name, email: users.email, avatar: users.avatar })
            .from(friendships)
            .innerJoin(users, eq(friendships.requesterId, users.id))
            .where(and(eq(friendships.addresseeId, userId), eq(friendships.status, 'PENDING')));
    }

    /**
     * Returns all pending or declined (blocked) friend requests sent by the given user.
     * DECLINED means the addressee blocked the requester — we still show the card to the sender.
     */
    static async getSentPendingRequests(db: DatabaseOrTransaction, userId: string) {
        return db
            .select({ id: users.id, name: users.name, email: users.email, avatar: users.avatar })
            .from(friendships)
            .innerJoin(users, eq(friendships.addresseeId, users.id))
            .where(
                and(
                    eq(friendships.requesterId, userId),
                    or(eq(friendships.status, 'PENDING'), eq(friendships.status, 'DECLINED'))
                )
            );
    }

    /**
     * Deletes friendship rows between the caller and another user that the caller is allowed to end.
     * Does not delete a BLOCKED row where the caller is the addressee (the blocked party), so
     * withdrawing a DECLINED outgoing request cannot remove the other user's block.
     */
    static async deleteFriendship(db: DatabaseOrTransaction, callerId: string, otherUserId: string) {
        return db
            .delete(friendships)
            .where(
                and(
                    or(
                        and(eq(friendships.requesterId, callerId), eq(friendships.addresseeId, otherUserId)),
                        and(eq(friendships.requesterId, otherUserId), eq(friendships.addresseeId, callerId))
                    ),
                    or(ne(friendships.status, 'BLOCKED'), ne(friendships.addresseeId, callerId))
                )
            );
    }

    /**
     * Blocks a user. If the blockId had sent a PENDING request to userId, that row is updated to
     * DECLINED (so the sender's card stays visible). All other rows between the pair are deleted,
     * then the (userId→blockId, BLOCKED) row is inserted.
     */
    static async blockUser(db: DatabaseOrTransaction, userId: string, blockId: string) {
        return db.transaction(async (tx) => {
            // Preserve the incoming request row as DECLINED so the sender can still see it
            await tx
                .update(friendships)
                .set({ status: 'DECLINED', updatedAt: new Date() })
                .where(
                    and(
                        eq(friendships.requesterId, blockId),
                        eq(friendships.addresseeId, userId),
                        eq(friendships.status, 'PENDING')
                    )
                );

            // Delete everything else between the pair except the row we just updated
            await tx
                .delete(friendships)
                .where(
                    or(
                        and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, blockId)),
                        and(
                            eq(friendships.requesterId, blockId),
                            eq(friendships.addresseeId, userId),
                            ne(friendships.status, 'DECLINED')
                        )
                    )
                );

            return tx
                .insert(friendships)
                .values({ requesterId: userId, addresseeId: blockId, status: 'BLOCKED', updatedAt: new Date() })
                .returning();
        });
    }

    /**
     * Returns all users blocked by the given user (id, name, email).
     */
    static async getBlockedUsers(db: DatabaseOrTransaction, userId: string) {
        return db
            .select({ id: users.id, name: users.name, email: users.email, avatar: users.avatar })
            .from(friendships)
            .innerJoin(users, eq(friendships.addresseeId, users.id))
            .where(and(eq(friendships.requesterId, userId), eq(friendships.status, 'BLOCKED')));
    }

    /**
     * Removes a block placed by userId on blockId.
     */
    static async unblockUser(db: DatabaseOrTransaction, userId: string, blockId: string) {
        return db.transaction(async (tx) => {
            await tx
                .delete(friendships)
                .where(
                    and(
                        eq(friendships.requesterId, userId),
                        eq(friendships.addresseeId, blockId),
                        eq(friendships.status, 'BLOCKED')
                    )
                );

            // Restore the original request so it reappears in the blocker's received-requests tab
            await tx
                .update(friendships)
                .set({ status: 'PENDING', updatedAt: new Date() })
                .where(
                    and(
                        eq(friendships.requesterId, blockId),
                        eq(friendships.addresseeId, userId),
                        eq(friendships.status, 'DECLINED')
                    )
                );
        });
    }

    /**
     * Returns the sharedWithFriends status for all schedules owned by the given user.
     */
    static async getScheduleSharingStatuses(db: DatabaseOrTransaction, userId: string) {
        return db
            .select({ id: schedules.id, sharedWithFriends: schedules.sharedWithFriends })
            .from(schedules)
            .where(eq(schedules.userId, userId));
    }

    /**
     * Toggles the sharedWithFriends flag on a schedule owned by the given user.
     * Returns the updated value, or null if the schedule was not found.
     */
    static async toggleScheduleSharing(
        db: DatabaseOrTransaction,
        userId: string,
        scheduleId: string
    ): Promise<{ sharedWithFriends: boolean } | null> {
        return db.transaction(async (tx) => {
            const [schedule] = await tx
                .select({ sharedWithFriends: schedules.sharedWithFriends })
                .from(schedules)
                .where(and(eq(schedules.id, scheduleId), eq(schedules.userId, userId)))
                .limit(1);

            if (!schedule) return null;

            const [updated] = await tx
                .update(schedules)
                .set({ sharedWithFriends: !schedule.sharedWithFriends })
                .where(and(eq(schedules.id, scheduleId), eq(schedules.userId, userId)))
                .returning({ sharedWithFriends: schedules.sharedWithFriends });

            return { sharedWithFriends: updated.sharedWithFriends };
        });
    }

    /**
     * Flags the guest user with the given username as imported, so the
     * "import by username" flow doesn't re-run for the same legacy schedule.
     *
     * @returns true if the user was successfully flagged as imported,
     *          false if they were already flagged or no matching guest exists.
     */
    static async flagImportedUser(db: DatabaseOrTransaction, username: string) {
        return db.transaction(async (tx) => {
            const row = await tx
                .select({ userId: users.id, imported: users.imported })
                .from(accounts)
                .innerJoin(users, eq(accounts.userId, users.id))
                .where(and(eq(accounts.accountType, 'GUEST'), eq(accounts.providerAccountId, username)))
                .limit(1)
                .then((res) => res[0] ?? null);

            if (!row || row.imported) {
                return false;
            }

            await tx.update(users).set({ imported: true }).where(eq(users.id, row.userId)).execute();
            return true;
        });
    }

    /**
     * Retrieves notifications associated with a specified user and environment.
     *
     * @param db - The database or transaction object to use for the operation.
     * @param userId - The ID of the user for whom we're retrieving notifications.
     * @param environment - The deployment environment to filter by (e.g. "production", "staging-1337").
     * @returns A promise that resolves to the notifications associated with a userId, or an empty array if not found.
     */
    static async retrieveNotifications(db: DatabaseOrTransaction, userId: string, environment: string) {
        return db
            .select()
            .from(subscriptions)
            .where(and(eq(subscriptions.userId, userId), eq(subscriptions.environment, environment)));
    }

    /**
     * Upserts notification for a specified user
     *
     * @param db - The database or transaction object to use for the operation.
     * @param userId - The ID of the user for whom we're upserting a notification.
     * @param notification - The notification object to upsert.
     * @param environment - "production" on production; staging instance + number on staging (e.g. "staging-1337").
     * @returns A promise that upserts the notification associated with a userId.
     */
    static async upsertNotification(
        db: DatabaseOrTransaction,
        userId: string,
        notification: Notification,
        environment: string
    ) {
        return db
            .insert(subscriptions)
            .values({
                userId,
                sectionCode: notification.sectionCode,
                year: notification.year,
                quarter: notification.quarter,
                notifyOnOpen: notification.notifyOn.notifyOnOpen,
                notifyOnWaitlist: notification.notifyOn.notifyOnWaitlist,
                notifyOnFull: notification.notifyOn.notifyOnFull,
                notifyOnRestriction: notification.notifyOn.notifyOnRestriction,
                lastUpdatedStatus: notification.lastUpdatedStatus,
                lastCodes: notification.lastCodes,
                environment,
            })
            .onConflictDoUpdate({
                target: [
                    subscriptions.userId,
                    subscriptions.sectionCode,
                    subscriptions.year,
                    subscriptions.quarter,
                    subscriptions.environment,
                ],
                set: buildConflictUpdateSet(subscriptions, {
                    userId: 'keep',
                    sectionCode: 'keep',
                    year: 'keep',
                    quarter: 'keep',
                    environment: 'keep',
                    notifyOnOpen: 'update',
                    notifyOnWaitlist: 'update',
                    notifyOnFull: 'update',
                    notifyOnRestriction: 'update',
                    lastUpdatedStatus: 'update',
                    lastCodes: 'update',
                    createdAt: 'keep',
                    updatedAt: 'update',
                }),
            });
    }

    /**
     * Updates lastUpdatedStatus and lastCodes of ALL notifications with a shared sectionCode, year, quarter, and environment.
     *
     * @param db - The database or transaction object to use for the operation.
     * @param notification - The notification object type we are updating.
     * @param environment - The deployment environment to filter by (e.g. "production", "staging-1337").
     * @returns A promise that updates ALL notifications with a shared sectionCode, year, quarter, and environment.
     */
    static async updateAllNotifications(db: DatabaseOrTransaction, notification: Notification, environment: string) {
        return db
            .update(subscriptions)
            .set({
                lastUpdatedStatus: notification.lastUpdatedStatus,
                lastCodes: notification.lastCodes,
            })
            .where(
                and(
                    eq(subscriptions.sectionCode, notification.sectionCode),
                    eq(subscriptions.year, notification.year),
                    eq(subscriptions.quarter, notification.quarter),
                    eq(subscriptions.environment, environment)
                )
            );
    }
    /**
     * Deletes a subscription row for the given user, section, term, and environment.
     *
     * @param db - The database or transaction object to use for the operation.
     * @param userId - The ID of the user for whom we're deleting a notification.
     * @param sectionCode - WebSOC section code.
     * @param term - Term string.
     * @param environment - The deployment environment to filter by (e.g. "production", "staging-1337").
     */
    static async deleteNotification(
        db: DatabaseOrTransaction,
        userId: string,
        sectionCode: string,
        year: Year,
        quarter: Quarter,
        environment: string
    ) {
        return db
            .delete(subscriptions)
            .where(
                and(
                    eq(subscriptions.userId, userId),
                    eq(subscriptions.sectionCode, sectionCode),
                    eq(subscriptions.year, year),
                    eq(subscriptions.quarter, quarter),
                    eq(subscriptions.environment, environment)
                )
            );
    }

    /**
     * Deletes ALL notifications for a specified user and environment.
     *
     * @param db - The database or transaction object to use for the operation.
     * @param userId - The ID of the user for whom we're deleting all notifications.
     * @param environment - The deployment environment to filter by (e.g. "production", "staging-1337").
     * @returns A promise that deletes all of a user's notifications.
     */
    static async deleteAllNotifications(db: DatabaseOrTransaction, userId: string, environment: string) {
        return db
            .delete(subscriptions)
            .where(and(eq(subscriptions.userId, userId), eq(subscriptions.environment, environment)));
    }
}
