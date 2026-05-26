import {
    advancedSearchParsers,
    courseSearchParamParsers,
} from '$components/RightPane/CoursePane/SearchForm/SearchParams/parsers';
import type {
    AdvancedSearchParams,
    CourseSearchParams,
} from '$components/RightPane/CoursePane/SearchForm/SearchParams/types';
import { createLoader } from 'nuqs';

export const loadAdvancedSearchParams = createLoader(advancedSearchParsers);
export const loadCourseSearchParams = createLoader(courseSearchParamParsers);

export function readAdvancedSearchParams(): AdvancedSearchParams {
    return loadAdvancedSearchParams(globalThis.location?.search ?? '');
}

export function readCourseSearchParams(): CourseSearchParams {
    return loadCourseSearchParams(globalThis.location?.search ?? '');
}
