import {
    defaultCourseSearchFormValues,
    useCoursePaneUrlState,
    useCourseSearchUrlState,
} from '$components/RightPane/CoursePane/SearchForm/searchParams';
import { AATerm } from '$lib/term';
import { useTabStore } from '$stores/TabStore';
import { useCallback } from 'react';

export function useQuickSearch() {
    const setActiveTab = useTabStore((s) => s.setActiveTab);
    const { setFields } = useCourseSearchUrlState();
    const { displaySections } = useCoursePaneUrlState();

    return useCallback(
        (deptValue: string, courseNumber: string, term: AATerm) => {
            void setFields({
                ...defaultCourseSearchFormValues,
                term,
                deptValue,
                courseNumber,
            });
            setActiveTab('search');
            void displaySections();
        },
        [displaySections, setActiveTab, setFields]
    );
}
