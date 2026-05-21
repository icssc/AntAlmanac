import { defaultFormData, useCourseSearchUrlState } from '$components/RightPane/CoursePane/SearchForm/searchParams';
import { AATerm } from '$lib/term';
import { useTabStore } from '$stores/TabStore';
import { useCallback } from 'react';

export function useQuickSearch() {
    const setActiveTab = useTabStore((s) => s.setActiveTab);
    const { setFields, setSearchMode, showResults } = useCourseSearchUrlState();

    return useCallback(
        (deptValue: string, courseNumber: string, term: AATerm) => {
            void setSearchMode('quick');
            void setFields({
                ...defaultFormData,
                term,
                deptValue,
                courseNumber,
            });
            setActiveTab('search');
            void showResults();
        },
        [setActiveTab, setFields, setSearchMode, showResults]
    );
}
