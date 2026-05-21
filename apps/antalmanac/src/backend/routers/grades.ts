import { aapiClient, aapiProcedure } from '$src/backend/lib/aapi';
import { GradesGeSchema } from '@packages/antalmanac-types';
import { getAllCourseIdentifiers, mergeAggregateGrades } from '@packages/antalmanac-types';
import type { AggregateGrades, AggregateGradesByOffering } from '@packages/anteater-api/types';
import { z } from 'zod';

import { router } from '../trpc';

const gradesInputSchema = z.object({
    department: z.string().optional(),
    courseNumber: z.string().optional(),
    instructor: z.string().optional(),
    ge: GradesGeSchema.optional(),
});

/**
 * Fetches aggregate grades for a course and all of its historical predecessors
 * (via the rename chain in `COURSE_RENAMES`), then merges the results into a
 * single `AggregateGrades` value.
 *
 * When no rename chain exists for the course, the function is equivalent to a
 * single direct API call with no overhead.
 */
async function fetchAndMergeGrades(input: z.infer<typeof gradesInputSchema>): Promise<AggregateGrades> {
    const { department, courseNumber } = input;

    // No rename look-up possible without both fields; fall back to a plain query.
    if (!department || !courseNumber) {
        return aapiClient.grades.aggregate(input);
    }

    const identifiers = getAllCourseIdentifiers({ department, courseNumber });

    // Single-course fast path — no rename chain.
    if (identifiers.length === 1) {
        return aapiClient.grades.aggregate(input);
    }

    // Fan out: query the current course with all original params (instructor,
    // ge, etc.), and query each predecessor by department + courseNumber only
    // (instructor/ge filters are not meaningful across a rename boundary).
    const [current, ...predecessors] = identifiers;
    const results = await Promise.all([
        aapiClient.grades.aggregate({ ...input, department: current.department, courseNumber: current.courseNumber }),
        ...predecessors.map((ci) =>
            aapiClient.grades.aggregate({ department: ci.department, courseNumber: ci.courseNumber })
        ),
    ]);

    // mergeAggregateGrades returns null only when every input is null/undefined.
    // aapiClient.grades.aggregate throws on failure, so `results` is always
    // populated — the non-null assertion is safe.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return mergeAggregateGrades(results)!;
}

const gradesRouter = router({
    aggregateGrades: aapiProcedure
        .input(gradesInputSchema)
        .query(({ input }): Promise<AggregateGrades> => fetchAndMergeGrades(input)),

    // Mutation so tRPC doesn't batch it with concurrent WebSOC queries.
    aggregateByOffering: aapiProcedure
        .input(
            z
                .object({
                    department: z.string().optional(),
                    courseNumber: z.string().optional(),
                    instructor: z.string().optional(),
                    ge: GradesGeSchema.optional(),
                })
                .transform(({ department, ge, ...rest }) => {
                    const dept = department?.toUpperCase();
                    return ge === undefined ? { department: dept, ...rest } : { department: dept, ge, ...rest };
                })
        )
        .mutation(({ input }): Promise<AggregateGradesByOffering> => aapiClient.grades.aggregateByOffering(input)),
});

export default gradesRouter;
