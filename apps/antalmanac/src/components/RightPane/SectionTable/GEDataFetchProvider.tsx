import RightPaneStore from '$components/RightPane/RightPaneStore';
import SectionTable from '$components/RightPane/SectionTable/SectionTable';
import { SectionTableProps } from '$components/RightPane/SectionTable/SectionTable.types';
import { WebSOC } from '$lib/websoc';
import AppStore from '$stores/AppStore';
import type { AACourse } from '@packages/antalmanac-types';
import { flattenCourses } from '@packages/anteater-api/utils';
import { useEffect, useState } from 'react';

/**
 * If we remove this component, when you search a department+GE combo, only the lectures show up, not the discussions.
 * This is because all the non-lecture sections don't have the GE specified so the initial search that included the
 * GE criteria will miss them.
 */
const GeDataFetchProvider = (props: SectionTableProps) => {
    const [courseDetails, setCourseDetails] = useState(props.courseDetails);

    useEffect(
        () => {
            (async () => {
                const formData = RightPaneStore.getFormData();

                const params = {
                    department: props.courseDetails.deptCode,
                    term: formData.term,
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

                const jsonResp = await WebSOC.query(params);

                const course = flattenCourses(jsonResp).find(
                    (c) => c.courseNumber === props.courseDetails.courseNumber
                );

                if (course) {
                    const courseColors = AppStore.schedule
                        .getCurrentCourses()
                        .reduce<Record<string, string>>((acc, { section }) => {
                            acc[section.sectionCode] = section.color;
                            return acc;
                        }, {});

                    setCourseDetails({
                        ...course,
                        sections: course.sections.map((s) => ({ ...s, color: courseColors[s.sectionCode] ?? '' })),
                        sectionTypes: [...new Set(course.sections.map((s) => s.sectionType))],
                    } satisfies AACourse);
                }
            })();
        },
        // Should only run once
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return <SectionTable {...props} courseDetails={courseDetails} />;
};

export default GeDataFetchProvider;
