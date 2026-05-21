import { aapiClient, aapiProcedure } from '$src/backend/lib/aapi';
import { getAllCourseIdentifiers, mergeAggregateGrades } from '$src/lib/courseRenames';
import { GradesGeSchema } from '@packages/antalmanac-types';
import type { AggregateGrades, AggregateGradesByOffering } from '@packages/anteater-api/types';
import { z } from 'zod';

import { router } from '../trpc';

const gradesRouter = router({
    aggregateGrades: aapiProcedure
        .input(
            z.object({
                department: z.string().optional(),
                courseNumber: z.string().optional(),
                instructor: z.string().optional(),
                ge: GradesGeSchema.optional(),
            })
        )
        .query(async ({ input }): Promise<AggregateGrades> => {
            const { department, courseNumber } = input;

            if (!department || !courseNumber) {
                return aapiClient.grades.aggregate(input);
            }

            const identifiers = getAllCourseIdentifiers(department, courseNumber);

            if (identifiers.length === 1) {
                return aapiClient.grades.aggregate(input);
            }

            // Instructor/ge filters only apply to the current course ID; predecessors
            // are queried by department + courseNumber only.
            const [current, ...predecessors] = identifiers;
            const settled = await Promise.allSettled([
                aapiClient.grades.aggregate({
                    ...input,
                    department: current.department,
                    courseNumber: current.courseNumber,
                }),
                ...predecessors.map((ci) =>
                    aapiClient.grades.aggregate({ department: ci.department, courseNumber: ci.courseNumber })
                ),
            ]);

            const fulfilled = settled
                .filter((r): r is PromiseFulfilledResult<AggregateGrades> => r.status === 'fulfilled')
                .map((r) => r.value);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return mergeAggregateGrades(fulfilled)!;
        }),

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
