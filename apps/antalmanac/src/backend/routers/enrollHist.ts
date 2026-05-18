import { aapiClient, aapiProcedure } from '$src/backend/lib/aapi';
import { WebsocSectionTypeSchema } from '@packages/antalmanac-types';
import type { EnrollmentHistoryEntry } from '@packages/anteater-api/types';
import { z } from 'zod';

import { router } from '../trpc';

const enrollHistRouter = router({
    get: aapiProcedure
        .input(
            z.object({
                department: z.string(),
                courseNumber: z.string(),
                sectionType: WebsocSectionTypeSchema,
            })
        )
        .query(async ({ input }): Promise<EnrollmentHistoryEntry[]> => {
            const data = await aapiClient.enrollmentHistory.get(input);

            // FIXME: remove this filter once the API stops returning entries with empty date arrays
            return data.filter((x: EnrollmentHistoryEntry) => x.dates.length);
        }),
});

export default enrollHistRouter;
