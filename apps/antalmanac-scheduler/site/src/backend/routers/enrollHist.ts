import { aapiClient, aapiProcedure } from '$backend/lib/aapi';
import { router } from '$backend/trpc';
import { getRenamedCoursesIdentifiers } from '$lib/renames/utils';
import { WebsocSectionTypeSchema } from '@packages/antalmanac-types';
import type { EnrollmentHistoryEntry } from '@packages/anteater-api/types';
import { z } from 'zod';

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
            const identifiers = getRenamedCoursesIdentifiers(department, courseNumber);

            const results = await Promise.all(
                identifiers.map((ci) =>
                    aapiClient.enrollmentHistory.get({
                        department: ci.deptCode,
                        courseNumber: ci.courseNumber,
                        sectionType,
                    })
                )
            );

            // FIXME: remove this filter once the API stops returning entries with empty date arrays
            return results.flat().filter((x: EnrollmentHistoryEntry) => x.dates.length);
        }),
});

export default enrollHistRouter;
