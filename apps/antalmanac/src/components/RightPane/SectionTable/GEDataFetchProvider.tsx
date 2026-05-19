import { useCourseSearchUrlState } from '$components/RightPane/CoursePane/SearchForm/searchParams';
import SectionTable, { SectionTableProps } from '$components/RightPane/SectionTable/SectionTable';
import { trpcReact } from '$lib/api/trpc';
import AppStore from '$stores/AppStore';
import type { AACourse } from '@packages/antalmanac-types';
import { flattenCourses } from '@packages/anteater-api/utils';
import { useMemo } from 'react';

/**
 * If we remove this component, when you search a department+GE combo, only the lectures show up, not the discussions.
 * This is because all the non-lecture sections don't have the GE specified so the initial search that included the
 * GE criteria will miss them.
 */
const GeDataFetchProvider = (props: SectionTableProps) => {
    const { formData } = useCourseSearchUrlState();
    const params = useMemo(() => {
        return {
            year: formData.term.year,
            quarter: formData.term.quarter,
            department: props.courseDetails.deptCode,
            ge: 'ANY',
            courseNumber: props.courseDetails.courseNumber,
            courseTitle: props.courseDetails.courseTitle,
            instructorName: formData.instructor,
            units: formData.units,
            endTime: formData.endTime,
            startTime: formData.startTime,
            fullCourses: formData.coursesFull,
            building: formData.building,
            room: formData.room,
            division: formData.division,
            excludeRestrictionCodes: formData.excludeRestrictionCodes.split('').join(','),
            days: formData.days.split(/(?=[A-Z])/).join(','),
        };
    }, [formData, props.courseDetails.courseNumber, props.courseDetails.courseTitle, props.courseDetails.deptCode]);

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
            ...course,
            sections: course.sections.map((s) => ({ ...s, color: courseColors[s.sectionCode] ?? '' })),
            sectionTypes: [...new Set(course.sections.map((s) => s.sectionType))],
        } satisfies AACourse;
    }, [data, props.courseDetails]);

    return <SectionTable {...props} courseDetails={courseDetails} />;
};

export default GeDataFetchProvider;
