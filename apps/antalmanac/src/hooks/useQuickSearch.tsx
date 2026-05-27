import {
    COURSE_SEARCH_MODE,
    COURSE_SEARCH_VIEW,
    DEFAULT_FORM_DATA,
    COURSE_SEARCH_MODE_KEY,
    COURSE_SEARCH_VIEW_KEY,
} from '$components/RightPane/CoursePane/SearchForm/SearchParams/constants';
import { serializeCourseSearchParams } from '$components/RightPane/CoursePane/SearchForm/SearchParams/parsers';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { AATerm } from '$lib/term';
import { useTabStore } from '$stores/TabStore';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useQuickSearch() {
    const navigate = useNavigate();
    const setActiveTab = useTabStore((s) => s.setActiveTab);

    return useCallback(
        (deptValue: string, courseNumber: string, term: AATerm) => {
            RightPaneStore.clearMultiSearchData();
            const courseSearch = serializeCourseSearchParams({
                ...DEFAULT_FORM_DATA,
                term,
                deptValue,
                courseNumber,
            });
            const searchParams = new URLSearchParams(courseSearch);
            searchParams.set(COURSE_SEARCH_MODE_KEY, COURSE_SEARCH_MODE.QUICK);
            searchParams.set(COURSE_SEARCH_VIEW_KEY, COURSE_SEARCH_VIEW.RESULTS);

            navigate({ pathname: '/', search: searchParams.toString() });
            setActiveTab('search');
        },
        [navigate, setActiveTab]
    );
}
