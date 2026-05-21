import { aapiClient, aapiProcedure } from '$src/backend/lib/aapi';
import { WebsocSectionTypeSchema } from '@packages/antalmanac-types';
import { getAllCourseIdentifiers } from '@packages/antalmanac-types';
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
            const { department, courseNumber, sectionType } = input;
            const identifiers = getAllCourseIdentifiers({ department, courseNumber });

            // Fan out across all predecessor course IDs in parallel.
            const results = await Promise.all(
                identifiers.map((ci) =>
                    aapiClient.enrollmentHistory.get({
                        department: ci.department,
                        courseNumber: ci.courseNumber,
                        sectionType,
                    })
                )
            );

            // Enrollment history entries are disjoint across rename boundaries
            // (data for each academic year lives under whichever course ID was
            // active at the time), so concatenation is safe — no de-duplication
            // is needed.
            // FIXME: remove this filter once the API stops returning entries with empty date arrays
            return results.flat().filter((x: EnrollmentHistoryEntry) => x.dates.length);
        }),
});

export default enrollHistRouter;
