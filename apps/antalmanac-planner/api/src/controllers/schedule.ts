/**
 @module ScheduleRoute
*/

import { TermResponse, WebsocAPIResponse, WeekData } from '@peterportal/types';
import { z } from 'zod';

import { ANTEATER_API_REQUEST_HEADERS } from '../helpers/headers';
import { publicProcedure, router } from '../helpers/trpc';

const callAAPIWebSoc = async (params: Record<string, string>) => {
    return await fetch(`${process.env.PUBLIC_API_URL}websoc?${new URLSearchParams(params)}`, {
        headers: ANTEATER_API_REQUEST_HEADERS,
    })
        .then((response) => response.json())
        .then((json) => json.data as WebsocAPIResponse);
};

const scheduleRouter = router({
    /**
     * Get the current week
     */
    currentWeek: publicProcedure.query(async () => {
        const apiResp = await fetch(`${process.env.PUBLIC_API_URL}week`, { headers: ANTEATER_API_REQUEST_HEADERS });
        const json = await apiResp.json();
        return json.data as WeekData;
    }),

    /**
     * Get when instruction starts for a term, from the Anteater API term calendar. The calendar only exists for terms
     * whose academic calendar has been published, so this returns null otherwise.
     */
    quarterCalendar: publicProcedure
        .input(z.object({ year: z.string(), quarter: z.string() }))
        .query(async ({ input }): Promise<{ instructionStart: string } | null> => {
            const params = new URLSearchParams({ year: input.year, quarter: input.quarter });
            const apiResp = await fetch(`${process.env.PUBLIC_API_URL}calendar?${params}`, {
                headers: ANTEATER_API_REQUEST_HEADERS,
            });
            if (!apiResp.ok) return null;
            const json = await apiResp.json();
            return json.data?.instructionStart ? { instructionStart: json.data.instructionStart as string } : null;
        }),

    /**
     * Get the current quarter on websoc
     */
    currentQuarter: publicProcedure.query(async () => {
        const apiResp = await fetch(`${process.env.PUBLIC_API_URL}websoc/terms`, {
            headers: ANTEATER_API_REQUEST_HEADERS,
        });
        const json = await apiResp.json();
        return (json.data as TermResponse)[0].shortName;
    }),

    /**
     * Proxy for WebSOC, using Anteater API
     */
    getTermDeptNum: publicProcedure
        .input(z.object({ term: z.string(), department: z.string(), number: z.string() }))
        .query(async ({ input }) => {
            const [year, quarter] = input.term.split(' ');
            const result = await callAAPIWebSoc({
                year,
                quarter,
                department: input.department,
                courseNumber: input.number,
            });
            return result;
        }),

    /**
     * Proxy for WebSOC, using Anteater API
     */
    getTermProf: publicProcedure
        .input(z.object({ term: z.string(), professor: z.string() }))
        .query(async ({ input }) => {
            const [year, quarter] = input.term.split(' ');
            const result = await callAAPIWebSoc({
                year,
                quarter,
                instructorName: input.professor,
            });
            return result;
        }),
});

export default scheduleRouter;
