import { ScheduleCourse } from '@packages/antalmanac-types';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import RightPaneStore from '$components/RightPane/RightPaneStore';
import AppStore from '$stores/AppStore';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useTabStore } from '$stores/TabStore';

export function useQuickSearch() {
    const { displaySections, forceUpdate } = useCoursePaneStore();
    const { setActiveTab } = useTabStore();
    const navigate = useNavigate();

    return useCallback(
        (deptValue: string, courseNumber: string, termValue: string, sectionCode = '') => {
            const queryParams = {
                term: termValue,
                deptValue: deptValue,
                courseNumber: courseNumber,
            };

            if ((!termValue || !deptValue || !courseNumber) && sectionCode.length > 0) {
                const course: ScheduleCourse = (AppStore.getAddedCourses() as unknown as ScheduleCourse[]).filter(
                    (course) =>
                        ('sectionCode' in course && course.sectionCode === sectionCode) ||
                        ('section' in course && course.section.sectionCode === sectionCode)
                )[0];
                termValue = course.term;
                deptValue = course.deptCode;
                courseNumber = course.courseNumber;
            }

            const href = `/?${Object.entries(queryParams)
                .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                .join('&')}`;

            RightPaneStore.resetFormValues();
            RightPaneStore.updateFormValue('deptValue', deptValue);
            RightPaneStore.updateFormValue('courseNumber', courseNumber);
            RightPaneStore.updateFormValue('term', termValue);
            navigate(href, { replace: false });
            setActiveTab('search');
            displaySections();
            forceUpdate();
        },
        [displaySections, forceUpdate, navigate, setActiveTab]
    );
}
