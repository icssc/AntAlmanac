import { aapiClient, aapiProcedure } from '$backend/lib/aapi';
import { router } from '$backend/trpc';
import { getRenamedCoursesIdentifiers, mergeAggregateGrades } from '$lib/renames/utils';
import { isNotEmpty } from '$lib/utils';
import type { GradeDistribution } from '@packages/anteater-api/types';
import { z } from 'zod';

const gradesRouter = router({
    aggregateGradesForCourse: aapiProcedure
        .input(
            z.object({
                department: z.string(),
                courseNumber: z.string(),
                instructor: z.string().optional(),
            })
        )
        .query(async ({ input }): Promise<GradeDistribution> => {
            const { department, courseNumber } = input;

            if (!department || !courseNumber) {
                return aapiClient.grades.aggregateByCourse(input).then(([course]) => course);
            }

            const identifiers = getRenamedCoursesIdentifiers(department, courseNumber);

            const results = await Promise.all(
                identifiers.map((ci) =>
                    aapiClient.grades
                        .aggregateByCourse({ ...input, department: ci.deptCode, courseNumber: ci.courseNumber })
                        .then(([course]) => course)
                )
            );

            if (!isNotEmpty(results)) {
                return aapiClient.grades.aggregateByCourse(input).then(([course]) => course);
            }

            return mergeAggregateGrades(results);
        }),
});

export default gradesRouter;
