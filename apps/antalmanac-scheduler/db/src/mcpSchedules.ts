import { AiScheduleChangesSchema, isAiSchedule, toAiScheduleName } from '@packages/antalmanac-types';
import { and, asc, eq, max, sql } from 'drizzle-orm';

import { db } from './index';
import { coursesInSchedule, customEvents, schedules, users } from './schema';

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Only call with the email read from the authenticated planner identity. */
async function resolveAccount(tx: Transaction, trustedEmail: string) {
    const matches = await tx
        .select()
        .from(users)
        .where(sql`lower(${users.email}) = lower(${trustedEmail})`)
        .limit(2);
    if (matches.length === 0)
        throw new Error('No scheduler account found. Sign into the scheduler first using your planner account email.');
    if (matches.length !== 1)
        throw new Error(
            'Multiple scheduler accounts match your planner email. Resolve the duplicate accounts before using scheduler tools.'
        );
    if (!matches[0].emailVerified)
        throw new Error(
            'Your scheduler account email is not verified. Sign into the scheduler and verify your email first.'
        );
    return matches[0];
}

async function scheduleView(tx: Transaction, schedule: typeof schedules.$inferSelect) {
    const sections = await tx
        .select()
        .from(coursesInSchedule)
        .where(eq(coursesInSchedule.scheduleId, schedule.id))
        .orderBy(asc(coursesInSchedule.index), asc(coursesInSchedule.sectionCode));
    const events = await tx
        .select()
        .from(customEvents)
        .where(eq(customEvents.scheduleId, schedule.id))
        .orderBy(asc(customEvents.id));
    return {
        id: schedule.id,
        name: schedule.name,
        notes: schedule.notes ?? '',
        index: schedule.index,
        editable: isAiSchedule(schedule.name),
        sections: sections.map((section) => ({
            sectionCode: String(section.sectionCode).padStart(5, '0'),
            term: section.term,
            color: section.color,
            visibility: section.visibility,
        })),
        customEvents: events.map((event) => ({
            customEventID: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            days: [...event.days].map((day) => day === '1'),
            ...(event.color == null ? {} : { color: event.color }),
            ...(event.building == null ? {} : { building: event.building }),
        })),
    };
}

export async function getOwnedSchedules(trustedEmail: string, scheduleId?: string) {
    return db.transaction(
        async (tx) => {
            const account = await resolveAccount(tx, trustedEmail);
            const rows = await tx
                .select()
                .from(schedules)
                .where(
                    scheduleId === undefined
                        ? eq(schedules.userId, account.id)
                        : and(eq(schedules.userId, account.id), eq(schedules.id, scheduleId))
                )
                .orderBy(asc(schedules.index));
            if (scheduleId !== undefined && rows.length === 0)
                throw new Error('Schedule not found in your scheduler account.');
            return Promise.all(rows.map((row) => scheduleView(tx, row)));
        },
        { isolationLevel: 'repeatable read', accessMode: 'read only' }
    );
}

/** A targeted transaction: never invoke the scheduler's whole-account save operation. */
export async function saveAiSchedule(trustedEmail: string, rawChanges: unknown, scheduleId?: string) {
    const parsed = AiScheduleChangesSchema.safeParse(rawChanges);
    if (!parsed.success) throw new Error(`Invalid schedule data: ${parsed.error.message}`);
    const changes = parsed.data;
    return db.transaction(async (tx) => {
        const account = await resolveAccount(tx, trustedEmail);
        let schedule: typeof schedules.$inferSelect;
        if (scheduleId === undefined) {
            // Serialize appends per account without changing the user's current selection.
            await tx.select({ id: users.id }).from(users).where(eq(users.id, account.id)).for('update');
            const [last] = await tx
                .select({ index: max(schedules.index) })
                .from(schedules)
                .where(eq(schedules.userId, account.id));
            [schedule] = await tx
                .insert(schedules)
                .values({
                    userId: account.id,
                    name: toAiScheduleName(changes.name),
                    notes: changes.notes ?? '',
                    index: (last.index ?? -1) + 1,
                })
                .returning();
        } else {
            const [target] = await tx
                .select()
                .from(schedules)
                .where(and(eq(schedules.id, scheduleId), eq(schedules.userId, account.id)))
                .for('update');
            if (!target) throw new Error('Schedule not found in your scheduler account.');
            if (!isAiSchedule(target.name))
                throw new Error(
                    'Refusing to edit this schedule: only schedules whose current name starts with "ai" can be modified.'
                );
            [schedule] = await tx
                .update(schedules)
                .set({
                    ...(changes.name === undefined ? {} : { name: toAiScheduleName(changes.name) }),
                    ...(changes.notes === undefined ? {} : { notes: changes.notes }),
                    lastUpdated: new Date(),
                })
                .where(and(eq(schedules.id, target.id), eq(schedules.userId, account.id)))
                .returning();
        }
        if (changes.sections !== undefined) {
            await tx.delete(coursesInSchedule).where(eq(coursesInSchedule.scheduleId, schedule.id));
            if (changes.sections.length)
                await tx.insert(coursesInSchedule).values(
                    changes.sections.map((section, index) => ({
                        ...section,
                        sectionCode: Number(section.sectionCode),
                        scheduleId: schedule.id,
                        index,
                    }))
                );
        }
        if (changes.customEvents !== undefined) {
            await tx.delete(customEvents).where(eq(customEvents.scheduleId, schedule.id));
            if (changes.customEvents.length)
                await tx.insert(customEvents).values(
                    changes.customEvents.map((event) => ({
                        id: String(event.customEventID),
                        scheduleId: schedule.id,
                        title: event.title,
                        start: event.start,
                        end: event.end,
                        days: event.days.map((day) => (day ? '1' : '0')).join(''),
                        color: event.color,
                        building: event.building,
                    }))
                );
        }
        return scheduleView(tx, schedule);
    });
}
