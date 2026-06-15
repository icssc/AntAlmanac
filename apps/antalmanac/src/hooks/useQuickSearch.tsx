import {
    COURSE_SEARCH_MODE,
    COURSE_SEARCH_VIEW,
    COURSE_SEARCH_MODE_KEY,
    COURSE_SEARCH_VIEW_KEY,
} from '$components/RightPane/CoursePane/SearchParams/constants';
import { DEFAULT_FORM_DATA } from '$components/RightPane/CoursePane/SearchParams/defaults';
import { serializeCourseSearchParams } from '$components/RightPane/CoursePane/SearchParams/parsers';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { navigateToTab } from '$lib/tabNavigation';
import type { AATerm } from '@packages/antalmanac-types';
import { useCallback } from 'react';

export function useQuickSearch() {
    return useCallback((deptValue: string, courseNumber: string, term: AATerm) => {
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

        navigateToTab('search', { search: searchParams.toString() });
    }, []);
}
