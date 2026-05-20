import {
    defaultCourseSearchFormValues,
    useCourseSearchUrlState,
} from '$components/RightPane/CoursePane/SearchForm/searchParams';
import { AATerm } from '$lib/term';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useTabStore } from '$stores/TabStore';
import { useCallback } from 'react';

export function useQuickSearch() {
    const setActiveTab = useTabStore((s) => s.setActiveTab);
    const { setFields, setSearchMode } = useCourseSearchUrlState();
    const setSearchFormIsDisplayed = useCoursePaneStore((store) => store.setSearchFormIsDisplayed);

    return useCallback(
        (deptValue: string, courseNumber: string, term: AATerm) => {
            void setSearchMode('quick');
            void setFields({
                ...defaultCourseSearchFormValues,
                term,
                deptValue,
                courseNumber,
            });
            setActiveTab('search');
            setSearchFormIsDisplayed(false);
        },
        [setActiveTab, setFields, setSearchFormIsDisplayed, setSearchMode]
    );
}
