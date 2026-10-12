/**
 @module ProgramsRoute
*/

import {
    MajorProgram,
    MajorSpecialization,
    SavedMajorProgram,
    MinorProgram,
    ProgramRequirement,
    SavedMinorProgram,
} from '@peterportal/types';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '../db';
import { planner, userMajor, userMajorCatalogYear, userMinor, userMinorCatalogYear } from '../db/schema';
import { ANTEATER_API_REQUEST_HEADERS } from '../helpers/headers';
import { publicProcedure, router } from '../helpers/trpc';

type ProgramType = MajorProgram | MinorProgram | MajorSpecialization;
const programTypeNames = ['major', 'minor', 'specialization'] as const;
const ugradRequirementTypeNames = ['UC', 'GE', 'CHC4', 'CHC2'] as const;

const getAPIProgramData = async <T extends ProgramType>(programType: string): Promise<T[]> => {
    const response = await fetch(`${process.env.PUBLIC_API_URL}programs/${programType}`, {
        headers: ANTEATER_API_REQUEST_HEADERS,
    })
        .then((res) => res.json())
        .then((res) => res.data as T[]);
    return response;
};

const zodMajorProgramSchema = z.object({
    majors: z.array(
        z.object({
            majorId: z.string(),
            specializationId: z.string().optional(),
            catalogYear: z.string().nullable().optional(),
        })
    ),
});

const zodMinorProgramSchema = z.object({
    minors: z
        .array(
            z.object({
                minorId: z.string(),
                catalogYear: z.string().nullable().optional(),
            })
        )
        .optional(),
});

const programsRouter = router({
    getMajors: publicProcedure.query(async () => {
        return getAPIProgramData<MajorProgram>('majors').then((r) => r.filter((m) => m.division === 'Undergraduate'));
    }),
    getMinors: publicProcedure.query(async () => {
        return getAPIProgramData<MinorProgram>('minors');
    }),
    getSpecializations: publicProcedure
        .input(z.object({ major: z.string(), catalogYear: z.string().optional() }))
        .query(async ({ input }) => {
            const url =
                `${process.env.PUBLIC_API_URL}programs/specializations?majorId=${input.major}` +
                (input.catalogYear ? `&catalogYear=${input.catalogYear}` : '');
            const response = await fetch(url, { headers: ANTEATER_API_REQUEST_HEADERS })
                .then((res) => res.json())
                .then((res) => (res.data as MajorSpecialization[] | undefined) ?? []);
            return response;
        }),
    getRequiredCourses: publicProcedure
        .input(
            z.object({
                type: z.enum(programTypeNames),
                programId: z.string(),
                specializationId: z.string().optional(),
                catalogYear: z.string().optional(),
            })
        )
        .query(async ({ input }) => {
            let url = `${process.env.PUBLIC_API_URL}programs/${input.type}?programId=${input.programId}`;
            if (input.type === 'major' && input.specializationId) {
                url += `&specializationId=${input.specializationId}`;
            }
            if (input.catalogYear) {
                url += `&catalogYear=${input.catalogYear}`;
            }
            const response = await fetch(url, { headers: ANTEATER_API_REQUEST_HEADERS })
                .then((res) => res.json())
                .then((res) => {
                    const schoolRequirements =
                        (res.data.schoolRequirements?.requirements as ProgramRequirement[]) ?? [];
                    const majorRequirements = res.data.requirements as ProgramRequirement[];
                    return {
                        requirements: [...schoolRequirements, ...majorRequirements],
                        catalogYear: res.data.catalogYear as string | undefined,
                    };
                });
            return response;
        }),
    getRequiredCoursesUgrad: publicProcedure
        .input(z.object({ id: z.enum(ugradRequirementTypeNames) }))
        .query(async ({ input }) => {
            const url = `${process.env.PUBLIC_API_URL}programs/ugradRequirements?id=${input.id}`;
            const response = await fetch(url, { headers: ANTEATER_API_REQUEST_HEADERS })
                .then((res) => res.json())
                .then((res) => res.data.requirements as ProgramRequirement[]);
            return response;
        }),
    getSavedMajors: publicProcedure.query(async ({ ctx }): Promise<SavedMajorProgram[]> => {
        const userId = ctx.session.userId;
        if (!userId) return [];

        const savedMajors = await db
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
            .where(eq(userMajor.userId, userId));

        const res = savedMajors.map((major) => ({
            majorId: major.majorId,
            specializationId: major.specializationId ?? undefined,
            catalogYear: major.catalogYear ?? undefined,
        }));

        return res;
    }),
    getSavedMinors: publicProcedure.query(async ({ ctx }): Promise<SavedMinorProgram[]> => {
        const userId = ctx.session.userId;
        if (!userId) return [];

        const res = await db
            .select({ minorId: userMinor.minorId, catalogYear: userMinorCatalogYear.catalogYear })
            .from(userMinor)
            .leftJoin(
                userMinorCatalogYear,
                and(
                    eq(userMinorCatalogYear.userId, userMinor.userId),
                    eq(userMinorCatalogYear.minorId, userMinor.minorId)
                )
            )
            .where(eq(userMinor.userId, userId));

        return res.map((r) => ({ id: r.minorId, name: '', catalogYear: r.catalogYear ?? undefined }));
    }),
    saveSelectedMajors: publicProcedure.input(zodMajorProgramSchema).mutation(async ({ input, ctx }) => {
        const userId = ctx.session.userId;
        if (!userId) throw new Error('Unauthorized');

        const { majors } = input;

        const rowsToInsert = majors.map((major) => ({
            userId,
            majorId: major.majorId,
            specializationId: major.specializationId,
        }));
        const catalogYearRowsToInsert = majors
            .filter((major) => major.catalogYear != null)
            .map((major) => ({
                userId,
                majorId: major.majorId,
                catalogYear: major.catalogYear!,
            }));

        await db.transaction(async (tx) => {
            await tx.delete(userMajor).where(eq(userMajor.userId, userId));
            if (rowsToInsert.length) {
                await tx.insert(userMajor).values(rowsToInsert);
            }
            if (catalogYearRowsToInsert.length) {
                await tx.insert(userMajorCatalogYear).values(catalogYearRowsToInsert);
            }
        });
    }),
    saveSelectedMinor: publicProcedure.input(zodMinorProgramSchema).mutation(async ({ input, ctx }) => {
        const userId = ctx.session.userId;
        if (!userId) throw new Error('Unauthorized');

        const { minors = [] } = input;

        const rowsToInsert = minors.map((minor) => ({ userId, minorId: minor.minorId }));
        const catalogYearRowsToInsert = minors
            .filter((minor) => minor.catalogYear != null)
            .map((minor) => ({ userId, minorId: minor.minorId, catalogYear: minor.catalogYear! }));

        await db.transaction(async (tx) => {
            await tx.delete(userMinor).where(eq(userMinor.userId, userId));
            if (rowsToInsert.length) {
                await tx.insert(userMinor).values(rowsToInsert);
            }
            if (catalogYearRowsToInsert.length) {
                await tx.insert(userMinorCatalogYear).values(catalogYearRowsToInsert);
            }
        });
    }),
    saveCHCSelection: publicProcedure
        .input(z.object({ plannerId: z.number(), chc: z.enum(['', 'CHC4', 'CHC2']) }))
        .mutation(async ({ input }) => {
            const { plannerId, chc } = input;
            await db
                .update(planner)
                .set({ chc: chc || null })
                .where(eq(planner.id, plannerId));
        }),
});

export default programsRouter;
