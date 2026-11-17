/**
 @module CoursesRoute
*/

import { AggregateGradesByOffering, CourseAAPIResponse, CourseBatchAAPIResponse, GradesRaw } from '@peterportal/types';
import { z } from 'zod';

import { ANTEATER_API_REQUEST_HEADERS } from '../helpers/headers';
import { publicProcedure, router } from '../helpers/trpc';

const coursesRouter = router({
    /**
     * Anteater API proxy for getting course data
     */
    get: publicProcedure.input(z.object({ courseID: z.string() })).query(async ({ input }) => {
        const r = fetch(`${process.env.PUBLIC_API_URL}courses/${encodeURIComponent(input.courseID)}`, {
            headers: ANTEATER_API_REQUEST_HEADERS,
        });

        return r.then((response) => response.json()).then((data) => data.data as CourseAAPIResponse);
    }),

    /**
     * Anteater API proxy for batch course data
     */
    batch: publicProcedure.input(z.object({ courses: z.string().array() })).mutation(async ({ input }) => {
        if (input.courses.length == 0) {
            return {};
        } else {
            const r = fetch(
                `${process.env.PUBLIC_API_URL}courses/batch?ids=${input.courses.map(encodeURIComponent).join(',')}`,
                { headers: ANTEATER_API_REQUEST_HEADERS }
            );

            return r
                .then((response) => response.json())
                .then(
                    (data: { data: CourseAAPIResponse[] }) =>
                        Object.fromEntries(data.data.map((x) => [x.id, x])) as CourseBatchAAPIResponse
                );
        }
    }),

    /**
     * Anteater API proxy for grade distribution
     */
    grades: publicProcedure.input(z.object({ department: z.string(), number: z.string() })).query(async ({ input }) => {
        const r = fetch(
            `${process.env.PUBLIC_API_URL}grades/raw?department=${encodeURIComponent(input.department)}&courseNumber=${input.number}`,
            { headers: ANTEATER_API_REQUEST_HEADERS }
        );

        return r.then((response) => response.json()).then((data) => data.data as GradesRaw);
    }),

    /**
     * Anteater API proxy for grades pre-aggregated per instructor (averageGPA + grade counts).
     * Far more compact than the raw per-section distribution and ideal for comparing professors.
     * Optionally narrow by instructor, year, and/or quarter.
     */
    gradesByInstructor: publicProcedure
        .input(
            z.object({
                department: z.string(),
                number: z.string(),
                instructor: z.string().optional(),
                year: z.string().optional(),
                quarter: z.string().optional(),
            })
        )
        .query(async ({ input }) => {
            const params = new URLSearchParams({ department: input.department, courseNumber: input.number });
            if (input.instructor) params.set('instructor', input.instructor);
            if (input.year) params.set('year', input.year);
            if (input.quarter) params.set('quarter', input.quarter);

            const r = fetch(`${process.env.PUBLIC_API_URL}grades/aggregateByOffering?${params}`, {
                headers: ANTEATER_API_REQUEST_HEADERS,
            });

            return r.then((response) => response.json()).then((data) => data.data as AggregateGradesByOffering[]);
        }),
});

export default coursesRouter;
