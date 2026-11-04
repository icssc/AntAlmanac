import { createId } from '@paralleldrive/cuid2';
import {
    RoadmapDiffs,
    roadmapDiffs,
    SavedPlannerData,
    SavedRoadmap,
    RoadmapItemDeletion,
    RoadmapSaveInfo,
    latestRoadmapVersion,
    SavedMajorProgram,
    SavedMinorProgram,
    TransferredAPExam,
    TransferredGE,
} from '@peterportal/types';
import { TRPCError } from '@trpc/server';
import { and, count, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

import { db, TransactionType } from '../db';
import {
    completedMarkerRequirement,
    customCard,
    override,
    planner,
    plannerCourse,
    selectedApReward,
    transferredApExam,
    transferredCourse,
    transferredGe,
    transferredMisc,
    user,
    userMajor,
    userMajorCatalogYear,
    userMinor,
    userMinorCatalogYear,
} from '../db/schema';
import {
    createPlanners,
    createQuarters,
    createYears,
    deletePlannerQuarters,
    deletePlanners,
    deletePlannerYears,
    queryGetPlanners,
    setQuarterCourses,
    updatePlanners,
    updateYears,
} from '../helpers/roadmap';
import { publicProcedure, router, userProcedure } from '../helpers/trpc';

type RoadmapChange = RoadmapItemDeletion | RoadmapSaveInfo;

function extractPlannerId(change: RoadmapChange): number {
    if ('plannerId' in change) return change.plannerId;
    if ('data' in change) return change.data.id;
    return change.id;
}

async function validatePlannerIds(input: RoadmapDiffs, userId: number) {
    const plannerIds = Object.entries(input)
        .filter(([key]) => !['overwrite', 'currentPlanIndex'].includes(key))
        .flatMap(([, value]) => value as RoadmapChange[])
        .map(extractPlannerId);
    const uniquePlanIds = [...new Set(plannerIds.filter((id) => id > 0))];

    // Ensure every planner ID belongs to that user (maybe look into RLS in the future)
    const foundPlanIdCount = await db
        .select({ count: count() })
        .from(planner)
        .where(and(eq(planner.userId, userId), inArray(planner.id, uniquePlanIds)))
        .then((c) => c[0].count);

    if (foundPlanIdCount !== uniquePlanIds.length) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
    }
}

async function performRoadmapDeletesAndUpdates(tx: TransactionType, input: RoadmapDiffs, userId: number) {
    if (input.overwrite) return await tx.delete(planner).where(eq(planner.userId, userId));

    const plannerDeletes = deletePlanners(tx, input.deletedPlanners);
    const yearDeletes = deletePlannerYears(tx, input.deletedYears);
    const quarterDeletes = deletePlannerQuarters(tx, input.deletedQuarters);
    await Promise.all([plannerDeletes, yearDeletes, quarterDeletes]);

    const courseUpdates = setQuarterCourses(tx, input.updatedQuarters);
    const yearUpdates = updateYears(tx, input.updatedYears);
    const plannerUpdates = updatePlanners(tx, input.updatedPlanners);
    await Promise.all([courseUpdates, yearUpdates, plannerUpdates]);
}

async function applyRoadmapChanges(input: RoadmapDiffs, userId: number) {
    return await db.transaction(async (tx) => {
        await performRoadmapDeletesAndUpdates(tx, input, userId);

        const plannerIdLookup = await createPlanners(tx, input.newPlanners, userId);

        // Update IDs in-place for newly-created planners. This guarantees that all
        // createYears and createQuarters data has the correct input before calling the function
        for (const toInsert of [...input.newYears, ...input.newQuarters]) {
            if (plannerIdLookup[toInsert.plannerId]) toInsert.plannerId = plannerIdLookup[toInsert.plannerId];
        }

        await createYears(tx, input.newYears);
        await createQuarters(tx, input.newQuarters);

        return plannerIdLookup;
    });
}

const plannerIdInput = z.object({ plannerId: z.number().int().positive() });

async function getOwnedPlanner(plannerId: number, userId: number) {
    const [found] = await db
        .select({ id: planner.id, shareId: planner.shareId })
        .from(planner)
        .where(and(eq(planner.id, plannerId), eq(planner.userId, userId)));
    if (!found) throw new TRPCError({ code: 'NOT_FOUND', message: 'Roadmap not found' });
    return found;
}

function isUniqueViolation(error: unknown) {
    const cause = (error as { cause?: { code?: string } })?.cause ?? error;
    return (cause as { code?: string })?.code === '23505';
}

const shareIdInput = z.object({ shareId: z.string().min(1).max(64) });

/**
 * Get everything the planner uses to check off degree requirements, as saved by the roadmap's owner
 */
async function getOwnerDegreeProgress(userId: number, plannerId: number) {
    const [majors, minors, markers, overrides, courses, apExams, selectedApRewards, ges, other, customCards] =
        await Promise.all([
            db
                .select({
                    majorId: userMajor.majorId,
                    specializationId: userMajor.specializationId,
                    catalogYear: userMajorCatalogYear.catalogYear,
                })
                .from(userMajor)
                .leftJoin(
                    userMajorCatalogYear,
                    and(
                        eq(userMajorCatalogYear.userId, userMajor.userId),
                        eq(userMajorCatalogYear.majorId, userMajor.majorId)
                    )
                )
                .where(eq(userMajor.userId, userId)),
            db
                .select({ minorId: userMinor.minorId, catalogYear: userMinorCatalogYear.catalogYear })
                .from(userMinor)
                .leftJoin(
                    userMinorCatalogYear,
                    and(
                        eq(userMinorCatalogYear.userId, userMinor.userId),
                        eq(userMinorCatalogYear.minorId, userMinor.minorId)
                    )
                )
                .where(eq(userMinor.userId, userId)),
            db
                .select({ markerName: completedMarkerRequirement.markerName })
                .from(completedMarkerRequirement)
                .where(eq(completedMarkerRequirement.userId, userId)),
            db
                .select({ requirement: override.requirement })
                .from(override)
                .where(and(eq(override.userId, userId), eq(override.plannerId, plannerId))),
            db
                .select({ courseName: transferredCourse.courseName, units: transferredCourse.units })
                .from(transferredCourse)
                .where(eq(transferredCourse.userId, userId)),
            db
                .select({
                    examName: transferredApExam.examName,
                    score: transferredApExam.score,
                    units: transferredApExam.units,
                })
                .from(transferredApExam)
                .where(eq(transferredApExam.userId, userId)),
            db
                .select({
                    examName: selectedApReward.examName,
                    path: selectedApReward.path,
                    selectedIndex: selectedApReward.selectedIndex,
                })
                .from(selectedApReward)
                .where(eq(selectedApReward.userId, userId)),
            db
                .select({
                    geName: transferredGe.geName,
                    numberOfCourses: transferredGe.numberOfCourses,
                    units: transferredGe.units,
                })
                .from(transferredGe)
                .where(eq(transferredGe.userId, userId)),
            db
                .select({ name: transferredMisc.courseName, units: transferredMisc.units })
                .from(transferredMisc)
                .where(eq(transferredMisc.userId, userId)),
            // Only the custom cards used in this roadmap, not all of the owner's cards
            db
                .selectDistinct({
                    id: customCard.id,
                    name: customCard.name,
                    description: customCard.description,
                    units: customCard.units,
                })
                .from(plannerCourse)
                .innerJoin(customCard, eq(customCard.id, plannerCourse.customCardId))
                .where(eq(plannerCourse.plannerId, plannerId)),
        ]);

    return {
        majors: majors.map(
            (m): SavedMajorProgram => ({
                majorId: m.majorId,
                specializationId: m.specializationId ?? undefined,
                catalogYear: m.catalogYear ?? undefined,
            })
        ),
        minors: minors.map(
            (m): SavedMinorProgram => ({ id: m.minorId, name: '', catalogYear: m.catalogYear ?? undefined })
        ),
        completedMarkers: markers.map((m) => m.markerName),
        overriddenRequirements: overrides.map((o) => o.requirement),
        transfers: {
            courses,
            apExams: apExams.map((exam) => ({ ...exam, score: exam.score ?? 0 })) as TransferredAPExam[],
            selectedApRewards,
            ges: ges as TransferredGE[],
            other,
        },
        customCards,
    };
}

const roadmapsRouter = router({
    /**
     * Get a user's roadmap
     */
    get: userProcedure.query(async ({ ctx }) => {
        const [planners, users] = await Promise.all([
            queryGetPlanners(eq(planner.userId, ctx.session.userId!)),
            db
                .select({ timestamp: user.lastRoadmapEditAt, currentPlanIndex: user.currentPlanIndex })
                .from(user)
                .where(eq(user.id, ctx.session.userId!)),
        ]);
        if (planners.length === 0) {
            return undefined;
        }
        const roadmap: SavedRoadmap = {
            planners: planners as SavedPlannerData[],
            timestamp: users[0].timestamp?.toISOString(),
            currentPlanIndex: users[0].currentPlanIndex ?? undefined,
            version: latestRoadmapVersion,
        };
        return roadmap;
    }),
    /**
     * Get a roadmap by its shareId
     */
    getByShareId: publicProcedure.input(shareIdInput).query(async ({ input }) => {
        const planners = await queryGetPlanners(eq(planner.shareId, input.shareId));
        if (planners.length === 0) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Shared planner not found',
            });
        }
        return planners[0];
    }),
    /**
     * Get a shared roadmap along with its owner's degree progress (programs, transfer credits, completed
     * markers, and overrides), so the read-only view can show which requirements the roadmap completes
     */
    getSharedView: publicProcedure.input(shareIdInput).query(async ({ input }) => {
        const [found] = await db
            .select({ id: planner.id, userId: planner.userId })
            .from(planner)
            .where(eq(planner.shareId, input.shareId));
        if (!found) throw new TRPCError({ code: 'NOT_FOUND', message: 'Shared planner not found' });

        const [[sharedPlanner], degreeProgress] = await Promise.all([
            queryGetPlanners(eq(planner.id, found.id)),
            getOwnerDegreeProgress(found.userId, found.id),
        ]);
        return { planner: sharedPlanner as SavedPlannerData, ...degreeProgress };
    }),
    /**
     * Save a user's roadmap
     */
    save: userProcedure.input(roadmapDiffs).mutation(async ({ input, ctx }) => {
        const userId = ctx.session.userId!;

        // When `overwrite` is true, we're never updating/deleting planner data by their planner id;
        // all new info gets written to the current user's account
        if (!input.overwrite) await validatePlannerIds(input, userId);
        const plannerIdLookup = await applyRoadmapChanges(input, userId);

        await db
            .update(user)
            .set({ lastRoadmapEditAt: new Date(), currentPlanIndex: input.currentPlanIndex })
            .where(eq(user.id, userId));

        return plannerIdLookup;
    }),
    /**
     * Ensure one of the user's roadmaps has a share ID, creating one if needed (e.g. for planners
     * created before share IDs were generated on insert)
     */
    ensureShareId: userProcedure.input(plannerIdInput).mutation(async ({ input, ctx }) => {
        const found = await getOwnedPlanner(input.plannerId, ctx.session.userId!);
        if (found.shareId) return { shareId: found.shareId };

        // A collision is astronomically unlikely, but retry rather than surface a DB error
        for (let attempt = 0; attempt < 3; attempt++) {
            const shareId = createId();
            try {
                await db.update(planner).set({ shareId }).where(eq(planner.id, found.id));
                return { shareId };
            } catch (error) {
                if (!isUniqueViolation(error)) throw error;
            }
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Could not create share link' });
    }),
});

export default roadmapsRouter;
