import {
    clearMultiSearchData,
    defaultFormData,
    serializeCourseSearchParams,
} from '$components/RightPane/CoursePane/SearchForm/searchParams';
import { AATerm } from '$lib/term';
import { useTabStore } from '$stores/TabStore';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useQuickSearch() {
    const navigate = useNavigate();
    const setActiveTab = useTabStore((s) => s.setActiveTab);

    return useCallback(
        (deptValue: string, courseNumber: string, term: AATerm) => {
            clearMultiSearchData();
            const courseSearch = serializeCourseSearchParams({
                ...defaultFormData,
                term,
                deptValue,
                courseNumber,
            });
            const searchParams = new URLSearchParams(courseSearch);
            searchParams.set('search', 'quick');
            searchParams.set('view', 'results');

            navigate({ pathname: '/', search: searchParams.toString() });
            setActiveTab('search');
        },
        [navigate, setActiveTab]
    );
}
