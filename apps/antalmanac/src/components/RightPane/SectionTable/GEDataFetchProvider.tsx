import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchParams/hooks';
import { advancedSearchParsers } from '$components/RightPane/CoursePane/SearchParams/parsers';
import { SectionTable, type SectionTableProps } from '$components/RightPane/SectionTable/SectionTable';
import { trpcReact } from '$lib/api/trpc';
import AppStore from '$stores/AppStore';
import type { AACourseWithTerm } from '@packages/antalmanac-types';
import { flattenCourses } from '@packages/anteater-api/utils';
import { useQueryStates } from 'nuqs';
import { useMemo } from 'react';

/**
 * If we remove this component, when you search a department+GE combo, only the lectures show up, not the discussions.
 * This is because all the non-lecture sections don't have the GE specified so the initial search that included the
 * GE criteria will miss them.
 */
export function GeDataFetchProvider(props: SectionTableProps) {
    const [term] = useCourseSearchParam('term');
    const [advanced] = useQueryStates(advancedSearchParsers);

    const params = useMemo(() => {
        return {
            year: term.year,
            quarter: term.quarter,
            department: props.course.deptCode,
            ge: 'ANY',
            courseNumber: props.course.courseNumber,
            courseTitle: props.course.courseTitle,
            instructorName: advanced.instructor,
            units: advanced.units,
            endTime: advanced.endTime,
            startTime: advanced.startTime,
            fullCourses: advanced.fullCourses,
            building: advanced.building,
            room: advanced.room,
            division: advanced.division,
            excludeRestrictionCodes: advanced.excludeRestrictionCodes,
            days: advanced.days,
        };
    }, [advanced, props.course.courseNumber, props.course.courseTitle, props.course.deptCode, term]);

    const { data } = trpcReact.websoc.getOne.useQuery(params);

    const course = useMemo(() => {
        if (!data) {
            return props.course;
        }

        const websocCourse = flattenCourses(data).find((c) => c.courseNumber === props.course.courseNumber);

        if (!websocCourse) {
            return props.course;
        }

        const courseColors = AppStore.schedule
            .getCurrentCourses()
            .reduce<Record<string, string>>((acc, { section }) => {
                acc[section.sectionCode] = section.color;
                return acc;
            }, {});

        return {
            ...websocCourse,
            term,
            sections: websocCourse.sections.map((s) => ({ ...s, color: courseColors[s.sectionCode] ?? '' })),
            sectionTypes: [...new Set(websocCourse.sections.map((s) => s.sectionType))],
        } satisfies AACourseWithTerm;
    }, [data, props.course, term]);

    return <SectionTable {...props} course={course} />;
}
