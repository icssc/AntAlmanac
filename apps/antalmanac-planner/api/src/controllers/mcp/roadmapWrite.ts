/**
 * Guarded roadmap writes for MCP agents.
 *
 * To protect a student's real planners, an agent may only modify planners whose name is
 * prefixed with "ai" (e.g. `ai-roadmap`). Every write resolves such a planner — creating
 * `ai-roadmap` if the student has none — and refuses to touch any non-`ai` planner. All
 * operations are scoped to the authenticated user's own planners.
 * @module
 */

import { and, asc, eq, sql } from 'drizzle-orm';

import { db } from '../../db';
import { planner, plannerCourse, plannerQuarter, plannerYear, user } from '../../db/schema';
import { queryGetPlanners } from '../../helpers/roadmap';

export const AI_PLANNER_PREFIX = 'ai';
export const DEFAULT_AI_PLANNER_NAME = 'ai-roadmap';

export const QUARTER_NAMES = ['Fall', 'Winter', 'Spring', 'Summer1', 'Summer10wk', 'Summer2'] as const;
export type QuarterName = (typeof QUARTER_NAMES)[number];

/** Whether a planner name is one the agent is allowed to modify. */
export function isAiPlanner(name: string): boolean {
    return name.trim().toLowerCase().startsWith(AI_PLANNER_PREFIX);
}

/** Force an agent-supplied planner name into the `ai` namespace. */
export function toAiPlannerName(name: string): string {
    const trimmed = name.trim();
    return isAiPlanner(trimmed) ? trimmed : `${AI_PLANNER_PREFIX}-${trimmed}`;
}

async function getOrCreatePlanner(userId: number, name: string): Promise<{ id: number; name: string }> {
    const [created] = await db.insert(planner).values({ userId, name }).onConflictDoNothing().returning();
    if (created) return { id: created.id, name: created.name };
    const [existing] = await db
        .select({ id: planner.id, name: planner.name })
        .from(planner)
        .where(and(eq(planner.userId, userId), eq(planner.name, name)));
    return existing;
}

/**
 * Resolve the `ai` planner a write should target.
 * - If `plannerName` is given it MUST be `ai`-prefixed (otherwise we refuse); it is created
 *   on demand when `allowCreate` is set.
 * - Otherwise the student's first existing `ai` planner is used, or `ai-roadmap` is created.
 */
export async function resolveAiPlanner(
    userId: number,
    plannerName: string | undefined,
    allowCreate: boolean
): Promise<{ id: number; name: string }> {
    if (plannerName !== undefined) {
        if (!isAiPlanner(plannerName)) {
            throw new Error(
                `Refusing to modify "${plannerName}": the AI agent may only change roadmaps whose name starts with "${AI_PLANNER_PREFIX}".`
            );
        }
        const [existing] = await db
            .select({ id: planner.id, name: planner.name })
            .from(planner)
            .where(and(eq(planner.userId, userId), eq(planner.name, plannerName.trim())));
        if (existing) return existing;
        if (!allowCreate) throw new Error(`No roadmap named "${plannerName}" exists.`);
        return getOrCreatePlanner(userId, plannerName.trim());
    }

    const [firstAi] = await db
        .select({ id: planner.id, name: planner.name })
        .from(planner)
        .where(and(eq(planner.userId, userId), sql`lower(${planner.name}) like ${AI_PLANNER_PREFIX + '%'}`))
        .orderBy(asc(planner.id));
    if (firstAi) return firstAi;
    if (!allowCreate) throw new Error('You have no AI roadmap yet. Add a course or create one first.');
    return getOrCreatePlanner(userId, DEFAULT_AI_PLANNER_NAME);
}

async function touchUser(userId: number): Promise<void> {
    await db.update(user).set({ lastRoadmapEditAt: new Date() }).where(eq(user.id, userId));
}

/** Return the current content of a single planner (for confirming a write back to the agent). */
async function plannerView(plannerId: number, name: string) {
    const [view] = await queryGetPlanners(eq(planner.id, plannerId));
    return view ?? { id: plannerId, name, content: [], chc: null };
}

const quarterMatch = (plannerId: number, startYear: number, quarterName: string) =>
    and(
        eq(plannerCourse.plannerId, plannerId),
        eq(plannerCourse.startYear, startYear),
        eq(plannerCourse.quarterName, quarterName)
    );

export interface CourseEdit {
    courseId: string;
    year: number;
    quarter: QuarterName;
    plannerName?: string;
}

/** Create (or return) an `ai`-namespaced planner. Non-`ai` names are coerced into the namespace. */
export async function createAiPlanner(userId: number, name: string) {
    const target = await getOrCreatePlanner(userId, toAiPlannerName(name));
    return plannerView(target.id, target.name);
}

/** Add a course to a quarter in an `ai` planner, creating the planner/year/quarter as needed. */
export async function addCourseToPlan(userId: number, edit: CourseEdit) {
    const target = await resolveAiPlanner(userId, edit.plannerName, true);

    await db.transaction(async (tx) => {
        await tx
            .insert(plannerYear)
            .values({
                plannerId: target.id,
                startYear: edit.year,
                name: `${edit.year} - ${edit.year + 1}`,
                collapsed: false,
            })
            .onConflictDoNothing();
        await tx
            .insert(plannerQuarter)
            .values({ plannerId: target.id, startYear: edit.year, quarterName: edit.quarter })
            .onConflictDoNothing();

        const existing = await tx
            .select({ courseId: plannerCourse.courseId, index: plannerCourse.index })
            .from(plannerCourse)
            .where(quarterMatch(target.id, edit.year, edit.quarter));
        if (existing.some((c) => c.courseId === edit.courseId)) return; // idempotent: already present

        const nextIndex = existing.length ? Math.max(...existing.map((c) => c.index)) + 1 : 0;
        await tx.insert(plannerCourse).values({
            plannerId: target.id,
            startYear: edit.year,
            quarterName: edit.quarter,
            index: nextIndex,
            courseId: edit.courseId,
            customCardId: null,
            units: null,
        });
    });

    await touchUser(userId);
    return plannerView(target.id, target.name);
}

/** Remove a course from a quarter in an `ai` planner, re-indexing the remaining courses. */
export async function removeCourseFromPlan(userId: number, edit: CourseEdit) {
    const target = await resolveAiPlanner(userId, edit.plannerName, false);
    let removed = false;

    await db.transaction(async (tx) => {
        const rows = await tx
            .select({
                courseId: plannerCourse.courseId,
                customCardId: plannerCourse.customCardId,
                units: plannerCourse.units,
            })
            .from(plannerCourse)
            .where(quarterMatch(target.id, edit.year, edit.quarter))
            .orderBy(asc(plannerCourse.index));

        const remaining = rows.filter((r) => r.courseId !== edit.courseId);
        if (remaining.length === rows.length) return; // course not found; nothing to do
        removed = true;

        await tx.delete(plannerCourse).where(quarterMatch(target.id, edit.year, edit.quarter));
        if (remaining.length) {
            await tx.insert(plannerCourse).values(
                remaining.map((r, index) => ({
                    plannerId: target.id,
                    startYear: edit.year,
                    quarterName: edit.quarter,
                    index,
                    courseId: r.courseId,
                    customCardId: r.customCardId,
                    units: r.units,
                }))
            );
        }
    });

    if (removed) await touchUser(userId);
    return { removed, planner: await plannerView(target.id, target.name) };
}
