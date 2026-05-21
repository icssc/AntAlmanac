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

            const results = await Promise.all(
                identifiers.map((ci) =>
                    aapiClient.grades.aggregate({ ...input, department: ci.department, courseNumber: ci.courseNumber })
                )
            );

            return mergeAggregateGrades(results);
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
