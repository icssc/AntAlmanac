import {
    defaultCourseSearchFormValues,
    useCourseSearchUrlState,
} from '$components/RightPane/CoursePane/SearchForm/searchParams';
import { AATerm } from '$lib/term';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useTabStore } from '$stores/TabStore';
import { useCallback } from 'react';

export function useQuickSearch() {
    const displaySections = useCoursePaneStore((s) => s.displaySections);
    const forceUpdate = useCoursePaneStore((s) => s.forceUpdate);
    const setActiveTab = useTabStore((s) => s.setActiveTab);
    const { setFields } = useCourseSearchUrlState();

    return useCallback(
        (deptValue: string, courseNumber: string, term: AATerm) => {
            void setFields({
                ...defaultCourseSearchFormValues,
                term,
                deptValue,
                courseNumber,
            });
            setActiveTab('search');
            displaySections();
            forceUpdate();
        },
        [displaySections, forceUpdate, setActiveTab, setFields]
    );
}
