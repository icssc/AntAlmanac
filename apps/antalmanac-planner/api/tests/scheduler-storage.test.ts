import { randomUUID } from 'node:crypto';

import { eq, inArray } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Explicit opt-in, restricted to loopback: these tests must never touch a remote account.
const testUrl = process.env.TEST_SCHEDULER_DATABASE_URL;
const integration = testUrl ? describe : describe.skip;
integration('scheduler transactional storage (local PostgreSQL)', () => {
    const token = randomUUID();
    const email = `mcp-${token}@example.test`;
    const foreignEmail = `foreign-${token}@example.test`;
    const unverifiedEmail = `unverified-${token}@example.test`;
    const ambiguousEmail = `ambiguous-${token}@example.test`;
    let storage: typeof import('@packages/db/src/mcpSchedules');
    let db: (typeof import('@packages/db'))['db'];
    let schema: typeof import('@packages/db/src/schema');
    let accountId: string;
    let protectedId: string;
    let foreignId: string;
    let userIds: string[] = [];
    let before: unknown;

    beforeAll(async () => {
        const url = new URL(testUrl!);
        if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
            throw new Error('Storage tests require a local database.');
        process.env.DB_URL = testUrl;
        ({ db } = await import('@packages/db'));
        schema = await import('@packages/db/src/schema');
        storage = await import('@packages/db/src/mcpSchedules');
        const accounts = await db
            .insert(schema.users)
            .values([
                { email, emailVerified: true },
                { email: foreignEmail, emailVerified: true },
                { email: unverifiedEmail, emailVerified: false },
                { email: ambiguousEmail, emailVerified: true },
                { email: ambiguousEmail.toUpperCase(), emailVerified: true },
            ])
            .returning();
        userIds = accounts.map((a) => a.id);
        accountId = accounts[0].id;
        const rows = await db
            .insert(schema.schedules)
            .values([
                { userId: accountId, name: 'My schedule', notes: 'keep me', index: 0, sharedWithFriends: false },
                { userId: accountId, name: 'Other schedule', notes: 'unchanged', index: 3 },
                { userId: accounts[1].id, name: 'ai-foreign', index: 0 },
            ])
            .returning();
        protectedId = rows[0].id;
        foreignId = rows[2].id;
        await db
            .insert(schema.coursesInSchedule)
            .values({ scheduleId: protectedId, term: '2026 Fall', sectionCode: 34000, color: '#123', index: 0 });
        await db.update(schema.users).set({ currentScheduleId: protectedId }).where(eq(schema.users.id, accountId));
        before = await snapshotProtected();
    });

    async function snapshotProtected() {
        return {
            schedules: await db.select().from(schema.schedules).where(eq(schema.schedules.id, protectedId)),
            courses: await db
                .select()
                .from(schema.coursesInSchedule)
                .where(eq(schema.coursesInSchedule.scheduleId, protectedId)),
            users: await db.select().from(schema.users).where(eq(schema.users.id, accountId)),
        };
    }

    afterAll(async () => {
        if (userIds.length) await db.delete(schema.users).where(inArray(schema.users.id, userIds));
    });

    it('reads owned schedules case-insensitively and denies foreign or nonexistent IDs', async () => {
        expect((await storage.getOwnedSchedules(email.toUpperCase())).map((s) => s.index)).toEqual([0, 3]);
        expect((await storage.getOwnedSchedules(email, protectedId))[0].editable).toBe(false);
        await expect(storage.getOwnedSchedules(email, foreignId)).rejects.toThrow('not found');
        await expect(storage.getOwnedSchedules(email, 'missing')).rejects.toThrow('not found');
    });

    it('rejects absent, unverified and ambiguous matches for both reads and writes', async () => {
        for (const [address, error] of [
            [`missing-${email}`, 'Sign into'],
            [unverifiedEmail, 'not verified'],
            [ambiguousEmail, 'Multiple'],
        ]) {
            await expect(storage.getOwnedSchedules(address)).rejects.toThrow(error);
            await expect(storage.saveAiSchedule(address, {})).rejects.toThrow(error);
        }
    });

    it('refuses non-ai and foreign edits without changing contents', async () => {
        await expect(storage.saveAiSchedule(email, { name: 'ai-takeover' }, protectedId)).rejects.toThrow(
            'current name'
        );
        await expect(storage.saveAiSchedule(email, { notes: 'takeover' }, foreignId)).rejects.toThrow('not found');
        expect(await snapshotProtected()).toEqual(before);
    });

    it('creates, renames and replaces individual fields, deduplicating sections', async () => {
        const section = { term: '2026 Fall', sectionCode: '34001', color: '#abcdef' };
        const event = {
            customEventID: 1,
            title: 'Study',
            start: '10:00',
            end: '11:00',
            days: [false, true, false, true, false, false, false],
            color: '#abc',
            building: 'DBH',
        };
        const created = await storage.saveAiSchedule(email, {
            name: 'Fall',
            notes: 'hello',
            sections: [section, section],
            customEvents: [event],
        });
        expect(created).toMatchObject({ name: 'ai-Fall', notes: 'hello', editable: true, index: 4 });
        expect(created.sections).toEqual([{ ...section, visibility: 'visible' }]);
        expect(created.customEvents).toEqual([{ ...event, customEventID: '1' }]);
        const updated = await storage.saveAiSchedule(email, { name: 'Winter', notes: '', sections: [] }, created.id);
        expect(updated).toMatchObject({
            id: created.id,
            name: 'ai-Winter',
            notes: '',
            sections: [],
            customEvents: created.customEvents,
        });
        const cleared = await storage.saveAiSchedule(
            email,
            { customEvents: [], sections: [{ ...section, visibility: 'outlined' }] },
            created.id
        );
        expect(cleared.customEvents).toEqual([]);
        expect(cleared.sections[0].visibility).toBe('outlined');
        expect(cleared.name).toBe('ai-Winter');
        const persisted = (await db.select().from(schema.schedules).where(eq(schema.schedules.id, created.id)))[0];
        expect(persisted.sharedWithFriends).toBe(true);
        expect(await snapshotProtected()).toEqual(before);
    });

    it('creates default names and concurrent schedules with unique appended indexes', async () => {
        const results = await Promise.all(Array.from({ length: 8 }, () => storage.saveAiSchedule(email, {})));
        expect(results.every((s) => s.name === 'ai-schedule')).toBe(true);
        expect(new Set(results.map((s) => s.id)).size).toBe(8);
        expect(results.map((s) => s.index).sort((a, b) => a - b)).toEqual([5, 6, 7, 8, 9, 10, 11, 12]);
        expect(await snapshotProtected()).toEqual(before);
    });

    it('rolls back parent and section changes when a later event insert fails', async () => {
        const schedule = await storage.saveAiSchedule(email, {
            notes: 'before',
            sections: [{ term: '2026 Fall', sectionCode: '34002', color: '#abc' }],
        });
        await expect(
            storage.saveAiSchedule(
                email,
                {
                    notes: 'after',
                    sections: [],
                    customEvents: [
                        {
                            customEventID: 'bad',
                            title: 'Postgres rejects NUL\u0000',
                            start: '',
                            end: '',
                            days: Array(7).fill(false),
                        },
                    ],
                },
                schedule.id
            )
        ).rejects.toThrow();
        expect((await storage.getOwnedSchedules(email, schedule.id))[0]).toEqual(schedule);
        const count = (await storage.getOwnedSchedules(email)).length;
        await expect(
            storage.saveAiSchedule(email, {
                customEvents: [
                    { customEventID: 'bad', title: '\u0000', start: '', end: '', days: Array(7).fill(false) },
                ],
            })
        ).rejects.toThrow();
        expect((await storage.getOwnedSchedules(email)).length).toBe(count);
    });

    it('rechecks the current name after a concurrent rename commits', async () => {
        const schedule = await storage.saveAiSchedule(email, {});
        let unlock!: () => void;
        let ready!: () => void;
        const locked = new Promise<void>((resolve) => {
            ready = resolve;
        });
        const release = new Promise<void>((resolve) => {
            unlock = resolve;
        });
        const rename = db.transaction(async (tx) => {
            await tx.update(schema.schedules).set({ name: 'Personal' }).where(eq(schema.schedules.id, schedule.id));
            ready();
            await release;
        });
        await locked;
        const edit = storage.saveAiSchedule(email, { notes: 'must not save' }, schedule.id);
        unlock();
        await rename;
        await expect(edit).rejects.toThrow('current name');
        // Prefix policy permits an existing schedule after the user renames it into ai.
        await db.update(schema.schedules).set({ name: '  AI personal  ' }).where(eq(schema.schedules.id, schedule.id));
        expect(await storage.saveAiSchedule(email, { notes: 'allowed' }, schedule.id)).toMatchObject({
            notes: 'allowed',
        });
    });

    it('rejects invalid inputs and duplicate custom-event IDs before writing', async () => {
        const event = { customEventID: 1, title: 'Duplicate', start: '', end: '', days: Array(7).fill(false) };
        await expect(storage.saveAiSchedule(email, { customEvents: [event, event] })).rejects.toThrow('unique');
        await expect(storage.saveAiSchedule(email, { notes: 'x'.repeat(5001) })).rejects.toThrow(
            'Invalid schedule data'
        );
        expect(await snapshotProtected()).toEqual(before);
    });
});
