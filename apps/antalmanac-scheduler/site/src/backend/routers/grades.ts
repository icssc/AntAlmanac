import { aapiClient, aapiProcedure } from '$backend/lib/aapi';
import { router } from '$backend/trpc';
import { getRenamedCoursesIdentifiers, mergeAggregateGrades } from '$lib/renames/utils';
import { isNotEmpty } from '$lib/utils';
import type { CourseGradeDistribution } from '@packages/anteater-api/types';
import { z } from 'zod';

const gradesRouter = router({
    aggregateGradesByCourse: aapiProcedure
        .input(
            z.object({
                department: z.string(),
                courseNumber: z.string(),
                instructor: z.string().optional(),
            })
        )
        .query(async ({ input }): Promise<CourseGradeDistribution | null> => {
            const { department, courseNumber } = input;

            const identifiers = getRenamedCoursesIdentifiers(department, courseNumber);

            const results = (
                await Promise.all(
                    identifiers.map((ci) =>
                        aapiClient.grades.aggregateBySingleCourse({
                            ...input,
                            department: ci.deptCode,
                            courseNumber: ci.courseNumber,
                        })
                    )
                )
            ).filter((result) => result !== null);

            if (!isNotEmpty(results)) {
                return null;
            }

            return mergeAggregateGrades(results);
        }),
});

export default gradesRouter;
