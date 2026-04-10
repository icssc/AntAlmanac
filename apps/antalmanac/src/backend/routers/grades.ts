import type { AggregateGradesAPIResult, AggregateGradesByOfferingAPIResult } from '@packages/antalmanac-types';
import { z } from 'zod';

import { procedure, router } from '../trpc';

import { fetchAnteaterAPI } from '$src/backend/lib/helpers';

const gradesRouter = router({
    aggregateGrades: procedure
        .input(
            z.object({
                department: z.string().optional(),
                courseNumber: z.string().optional(),
                instructor: z.string().optional(),
                ge: z.string().optional(),
            })
        )
        .query(async ({ input }) => {
            const result = await fetchAnteaterAPI<AggregateGradesAPIResult>(
                `https://anteaterapi.com/v2/rest/grades/aggregate?${new URLSearchParams(input)}`,
                { errorType: 'trpc' }
            );
            return result.data;
        }),
    // This is a "mutation" because we don't want tRPC to batch it with the query for WebSoc data.
    aggregateByOffering: procedure
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
        .mutation(async ({ input }) => {
            const result = await fetchAnteaterAPI<AggregateGradesByOfferingAPIResult>(
                `https://anteaterapi.com/v2/rest/grades/aggregateByOffering?${new URLSearchParams(
                    input as Record<string, string>
                )}`,
                { errorType: 'trpc' }
            );
            return result.data;
        }),
});

export default gradesRouter;
