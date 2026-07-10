/**
 @module ReportsRoute
*/

import { type ReportData, reportSubmission } from '@packages/planner-types';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '../db';
import { report } from '../db/schema';
import { datesToStrings } from '../helpers/date';
import { adminProcedure, publicProcedure, router } from '../helpers/trpc';

const reportsRouter = router({
    /**
     * Get all reports
     */
    get: adminProcedure.query(async () => {
        return (await db.select().from(report)).map((report) => datesToStrings(report)) as ReportData[];
    }),
    /**
     * Add a report
     */
    add: publicProcedure.input(reportSubmission).mutation(async ({ input }) => {
        await db.insert(report).values(input);
        return input;
    }),
    /**
     * Delete reports by review id
     */
    delete: adminProcedure.input(z.object({ reviewId: z.number() })).mutation(async ({ input }) => {
        await db.delete(report).where(eq(report.reviewId, input.reviewId));
        return true;
    }),
});

export default reportsRouter;
