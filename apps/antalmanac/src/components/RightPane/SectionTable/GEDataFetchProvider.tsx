import { useCourseSearchUrlState } from '$components/RightPane/CoursePane/SearchForm/courseSearchUrlState';
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
    const searchFields = useCourseSearchUrlState((state) => ({
        term: state.formData.term,
        instructor: state.formData.instructor,
        units: state.formData.units,
        endTime: state.formData.endTime,
        startTime: state.formData.startTime,
        coursesFull: state.formData.coursesFull,
        building: state.formData.building,
        room: state.formData.room,
        division: state.formData.division,
        excludeRestrictionCodes: state.formData.excludeRestrictionCodes,
        days: state.formData.days,
    }));
    const params = useMemo(() => {
        return {
            year: searchFields.term.year,
            quarter: searchFields.term.quarter,
            department: props.courseDetails.deptCode,
            ge: 'ANY',
            courseNumber: props.courseDetails.courseNumber,
            courseTitle: props.courseDetails.courseTitle,
            instructorName: searchFields.instructor,
            units: searchFields.units,
            endTime: searchFields.endTime,
            startTime: searchFields.startTime,
            fullCourses: searchFields.coursesFull,
            building: searchFields.building,
            room: searchFields.room,
            division: searchFields.division,
            excludeRestrictionCodes: searchFields.excludeRestrictionCodes.split('').join(','),
            days: searchFields.days.split(/(?=[A-Z])/).join(','),
        };
    }, [searchFields, props.courseDetails.courseNumber, props.courseDetails.courseTitle, props.courseDetails.deptCode]);

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
