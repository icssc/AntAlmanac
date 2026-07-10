/**
 @module CourseMaterialsRoute
*/

import { type CourseMaterialsAAPIResponse } from '@packages/planner-types';
import { z } from 'zod';

import { ANTEATER_API_REQUEST_HEADERS } from '../helpers/headers';
import { publicProcedure, router } from '../helpers/trpc';

const CourseMaterialsRouter = router({
    /**
     * Anteater API proxy for getting course materials data
     */
    get: publicProcedure.input(z.object({ department: z.string(), number: z.string() })).query(async ({ input }) => {
        const url = `${process.env.PUBLIC_API_URL}courseMaterials?department=${encodeURIComponent(input.department)}&courseNumber=${input.number}`;

        const response = await fetch(url, { headers: ANTEATER_API_REQUEST_HEADERS })
            .then((res) => res.json())
            .then((res) => {
                return (res.data as CourseMaterialsAAPIResponse) ?? [];
            });

        return response;
    }),

    getTermDeptNum: publicProcedure
        .input(z.object({ term: z.string(), department: z.string(), number: z.string() }))
        .query(async ({ input }) => {
            const [year, quarter] = input.term.split(' ');
            const quarterGeneralized = quarter.includes('Summer') ? 'Summer' : quarter;
            const url = `${process.env.PUBLIC_API_URL}courseMaterials?year=${year}&quarter=${quarterGeneralized}&department=${encodeURIComponent(input.department)}&courseNumber=${input.number}`;
            const response = await fetch(url, { headers: ANTEATER_API_REQUEST_HEADERS })
                .then((res) => res.json())
                .then((res) => {
                    if (!res?.ok) return [];
                    return (res.data as CourseMaterialsAAPIResponse) ?? [];
                });
            return response;
        }),
});

export default CourseMaterialsRouter;
