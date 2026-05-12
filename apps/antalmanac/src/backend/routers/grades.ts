import { aapiClient, aapiProcedure } from '$src/backend/lib/aapi';
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
                ge: z.string().optional(),
            })
        )
        .query(({ input }): Promise<AggregateGrades> => aapiClient.grades.aggregate(input)),

    // Mutation so tRPC doesn't batch it with concurrent WebSOC queries.
    aggregateByOffering: aapiProcedure
        .input(
            z
                .object({
                    department: z.string().optional(),
                    courseNumber: z.string().optional(),
                    instructor: z.string().optional(),
                    ge: z.string().optional(),
                })
                .transform(({ department, ge, ...rest }) => {
                    const dept = department?.toUpperCase();
                    return ge === undefined ? { department: dept, ...rest } : { department: dept, ge, ...rest };
                })
        )
        .mutation(({ input }): Promise<AggregateGradesByOffering> => aapiClient.grades.aggregateByOffering(input)),
});

export default gradesRouter;
