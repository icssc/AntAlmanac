import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchParams/hooks';
import { advancedSearchParsers } from '$components/RightPane/CoursePane/SearchParams/parsers';
import SectionTable, { SectionTableProps } from '$components/RightPane/SectionTable/SectionTable';
import { trpcReact } from '$lib/api/trpc';
import AppStore from '$stores/AppStore';
import type { AACourse } from '@packages/antalmanac-types';
import { flattenCourses } from '@packages/anteater-api/utils';
import { useQueryStates } from 'nuqs';
import { useMemo } from 'react';

/**
 * If we remove this component, when you search a department+GE combo, only the lectures show up, not the discussions.
 * This is because all the non-lecture sections don't have the GE specified so the initial search that included the
 * GE criteria will miss them.
 */
const GeDataFetchProvider = (props: SectionTableProps) => {
    const [term] = useCourseSearchParam('term');
    const [advanced] = useQueryStates(advancedSearchParsers);

    const params = useMemo(() => {
        return {
            year: term.year,
            quarter: term.quarter,
            department: props.courseDetails.deptCode,
            ge: 'ANY',
            courseNumber: props.courseDetails.courseNumber,
            courseTitle: props.courseDetails.courseTitle,
            instructorName: advanced.instructor,
            units: advanced.units,
            endTime: advanced.endTime,
            startTime: advanced.startTime,
            fullCourses: advanced.coursesFull,
            building: advanced.building,
            room: advanced.room,
            division: advanced.division,
            excludeRestrictionCodes: advanced.excludeRestrictionCodes.split('').join(','),
            days: advanced.days.split(/(?=[A-Z])/).join(','),
        };
    }, [
        advanced,
        props.courseDetails.courseNumber,
        props.courseDetails.courseTitle,
        props.courseDetails.deptCode,
        term,
    ]);

    const { data } = trpcReact.websoc.getOne.useQuery(params);

    const courseDetails = useMemo(() => {
        if (!data) {
            return props.courseDetails;
        }

        const course = flattenCourses(data).find((c) => c.courseNumber === props.courseDetails.courseNumber);

        if (!course) {
            return props.courseDetails;
        }

        const courseColors = AppStore.schedule
            .getCurrentCourses()
            .reduce<Record<string, string>>((acc, { section }) => {
                acc[section.sectionCode] = section.color;
                return acc;
            }, {});

        return {
            deptCode: props.courseDetails.deptCode,
            ...course,
            sections: course.sections.map((s) => ({ ...s, color: courseColors[s.sectionCode] ?? '' })),
            sectionTypes: [...new Set(course.sections.map((s) => s.sectionType))],
        } satisfies AACourse;
    }, [data, props.courseDetails]);

    return <SectionTable {...props} courseDetails={courseDetails} />;
};

export default GeDataFetchProvider;
