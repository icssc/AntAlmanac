import { EnrollmentHistoryAPIResult } from '@packages/antalmanac-types';
import { z } from 'zod';

import { procedure, router } from '../trpc';

import { fetchAnteaterAPI } from '$src/backend/lib/helpers';

const enrollHistRouter = router({
    get: procedure
        .input(z.object({ department: z.string(), courseNumber: z.string(), sectionType: z.string() }))
        .query(async ({ input }) => {
            const result = await fetchAnteaterAPI<EnrollmentHistoryAPIResult>(
                `https://anteaterapi.com/v2/rest/enrollmentHistory?${new URLSearchParams(input)}`
            );
            return result.data.filter((x) => x.dates.length); // FIXME remove this shim once this is fixed on the API end
        }),
});

export default enrollHistRouter;
