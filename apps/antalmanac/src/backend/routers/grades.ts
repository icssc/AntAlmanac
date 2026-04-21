import { fetchAnteaterAPI } from '$src/backend/lib/helpers';
import type {
    AggregateGradesAPIResult,
    AggregateGradesByOfferingAPIResult,
    RawGradesAPIResult,
} from '@packages/antalmanac-types';
import { z } from 'zod';

import { procedure, router } from '../trpc';

const QUARTER_ENUM = z.enum(['Fall', 'Winter', 'Spring', 'Summer1', 'Summer10wk', 'Summer2']);
const DIVISION_ENUM = z.enum(['LowerDiv', 'UpperDiv', 'Graduate', 'ANY']);

/**
 * Shared input shape for the Anteater grades endpoints.
 *
 * Mirrors the query parameters supported by
 * `/v2/rest/grades/{aggregate,raw}`. All fields are optional; any provided
 * field is forwarded to Anteater as a filter.
 */
const gradesFilterSchema = z.object({
    department: z.string().optional(),
    courseNumber: z.string().optional(),
    instructor: z.string().optional(),
    sectionCode: z.string().optional(),
    year: z.string().optional(),
    quarter: QUARTER_ENUM.optional(),
    division: DIVISION_ENUM.optional(),
    ge: z.string().optional(),
    excludePNP: z.string().optional(),
});

/**
 * Strip empty / undefined values so we don't send `&foo=` to Anteater,
 * and uppercase the department code (matching the pre-existing router
 * behaviour for `aggregateByOffering`).
 */
function toQueryString(input: z.infer<typeof gradesFilterSchema>): string {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(input)) {
        if (value === undefined || value === null || value === '') continue;
        normalized[key] = key === 'department' ? String(value).toUpperCase() : String(value);
    }
    return new URLSearchParams(normalized).toString();
}

const gradesRouter = router({
    aggregateGrades: procedure.input(gradesFilterSchema).query(async ({ input }) => {
        const result = await fetchAnteaterAPI<AggregateGradesAPIResult>(
            `https://anteaterapi.com/v2/rest/grades/aggregate?${toQueryString(input)}`,
            { errorType: 'trpc' }
        );
        return result.data;
    }),
    // This is a "mutation" because we don't want tRPC to batch it with the query for WebSoc data.
    aggregateByOffering: procedure.input(gradesFilterSchema).mutation(async ({ input }) => {
        const result = await fetchAnteaterAPI<AggregateGradesByOfferingAPIResult>(
            `https://anteaterapi.com/v2/rest/grades/aggregateByOffering?${toQueryString(input)}`,
            { errorType: 'trpc' }
        );
        return result.data;
    }),
    /**
     * Per-section rows for advanced views (details table, year-over-year
     * trends). Kept as a `mutation` so it isn't batched with `aggregateGrades`
     * calls inside the Grade Explorer — each modal tab wants its own fetch.
     */
    rawGrades: procedure.input(gradesFilterSchema).mutation(async ({ input }) => {
        const result = await fetchAnteaterAPI<RawGradesAPIResult>(
            `https://anteaterapi.com/v2/rest/grades/raw?${toQueryString(input)}`,
            { errorType: 'trpc' }
        );
        return result.data;
    }),
});

export default gradesRouter;
