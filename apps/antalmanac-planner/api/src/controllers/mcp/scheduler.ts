import { ScheduleTermSchema, WebsocSearchInputSchema, sanitizeWebsocParams } from '@packages/antalmanac-types';
import type { WebsocSearchInput } from '@packages/antalmanac-types';
import { createClient } from '@packages/anteater-api/client';
import { sortWebsocResponse } from '@packages/anteater-api/utils';
import { eq } from 'drizzle-orm';

import { db } from '../../db';
import { user } from '../../db/schema';

/** Resolve identity server-side; no tool accepts an email or account ID. */
async function schedulerAccount(userId: number) {
    const [identity] = await db.select({ email: user.email }).from(user).where(eq(user.id, userId));
    if (!identity?.email)
        throw new Error('Your authenticated planner account has no email. Sign into the planner again.');
    if (!process.env.DB_URL)
        throw new Error('Scheduler storage is not configured (DB_URL). Planner tools remain available.');
    return { email: identity.email, storage: await import('@packages/db/src/mcpSchedules') };
}

export async function searchSections(rawInput: { term: string } & Partial<WebsocSearchInput>) {
    const { term, ...filters } = rawInput;
    const validTerm = ScheduleTermSchema.safeParse(term);
    if (!validTerm.success) throw new Error('Invalid term. Use a term such as "2026 Fall".');
    const [year, quarter] = validTerm.data.split(' ');
    const params = WebsocSearchInputSchema.parse({ ...filters, year, quarter });
    try {
        return sortWebsocResponse(
            await createClient({ apiKey: process.env.ANTEATER_API_KEY }).websoc.query(sanitizeWebsocParams(params))
        );
    } catch (error) {
        throw new Error(
            `WebSOC section search failed: ${error instanceof Error ? error.message : 'upstream service unavailable'}`
        );
    }
}

export async function getSchedules(userId: number) {
    const { email, storage } = await schedulerAccount(userId);
    return storage.getOwnedSchedules(email);
}

export async function getSchedule(userId: number, scheduleId: string) {
    const { email, storage } = await schedulerAccount(userId);
    const [schedule] = await storage.getOwnedSchedules(email, scheduleId);
    // Preserve references when historical offerings are unavailable, and report the failure.
    const terms = [...new Set(schedule.sections.map((section) => section.term))];
    const offerings = await Promise.all(
        terms.map(async (term) => {
            try {
                const response = await searchSections({
                    term,
                    sectionCodes: schedule.sections
                        .filter((s) => s.term === term)
                        .map((s) => s.sectionCode)
                        .join(','),
                });
                return {
                    term,
                    courses: response.schools.flatMap((school) =>
                        school.departments.flatMap((department) => department.courses)
                    ),
                };
            } catch (error) {
                return {
                    term,
                    courses: [],
                    error: error instanceof Error ? error.message : 'Meeting details unavailable.',
                };
            }
        })
    );
    return { ...schedule, offerings };
}

export async function writeAiSchedule(userId: number, changes: unknown, scheduleId?: string) {
    const { email, storage } = await schedulerAccount(userId);
    return storage.saveAiSchedule(email, changes, scheduleId);
}
