import { COURSE_SEARCH_MODE_KEY } from '$components/RightPane/CoursePane/SearchForm/SearchParams/constants';
import {
    advancedSearchParsers,
    courseSearchParamParsers,
    searchModeParser,
} from '$components/RightPane/CoursePane/SearchForm/SearchParams/parsers';
import type {
    AdvancedSearchParams,
    CourseSearchMode,
    CourseSearchParams,
} from '$components/RightPane/CoursePane/SearchForm/SearchParams/types';
import { createLoader } from 'nuqs';

const loadAdvancedSearchParams = createLoader(advancedSearchParsers);
const loadCourseSearchParams = createLoader(courseSearchParamParsers);
const loadSearchMode = createLoader({
    [COURSE_SEARCH_MODE_KEY]: searchModeParser,
});

export function readAdvancedSearchParams(): AdvancedSearchParams {
    return loadAdvancedSearchParams(globalThis.location?.search ?? '');
}

export function readCourseSearchParams(): CourseSearchParams {
    return loadCourseSearchParams(globalThis.location?.search ?? '');
}

export function readSearchMode(): CourseSearchMode {
    return loadSearchMode(globalThis.location?.search ?? '')[COURSE_SEARCH_MODE_KEY];
}
