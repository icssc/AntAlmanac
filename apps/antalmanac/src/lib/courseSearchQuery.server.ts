import 'server-only';
import { getSelectedGEs } from '$components/RightPane/CoursePane/SearchForm/constants';
import {
    COURSE_SEARCH_MODE,
    COURSE_SEARCH_MODE_KEY,
    COURSE_SEARCH_VIEW_KEY,
} from '$components/RightPane/CoursePane/SearchParams/constants';
import {
    deriveCourseSearchView,
    hasAdvancedParams,
    hasManualParams,
    isValidSearch,
} from '$components/RightPane/CoursePane/SearchParams/helpers';
import {
    advancedSearchParsers,
    courseSearchParamParsers,
    searchModeParser,
    searchViewParser,
} from '$components/RightPane/CoursePane/SearchParams/parsers';
import type { CourseSearchParams } from '$components/RightPane/CoursePane/SearchParams/types';
import { queryKeys } from '$lib/queryKeys';
import type { AppRouter } from '$src/backend/routers';
import type { WebsocSearchInput } from '@packages/antalmanac-types';
import type { WebsocAPIResponse } from '@packages/anteater-api/types';
import { intersectWebsocResponses } from '@packages/anteater-api/utils';
import type { QueryClient } from '@tanstack/react-query';
import type { inferRouterOutputs } from '@trpc/server';
import { createLoader, createSearchParamsCache } from 'nuqs/server';

type ServerCaller = ReturnType<AppRouter['createCaller']>;

const loadCourseSearchParams = createLoader(courseSearchParamParsers);
const loadAdvancedSearchParams = createLoader(advancedSearchParsers);
const loadSearchMode = createLoader({ [COURSE_SEARCH_MODE_KEY]: searchModeParser });
const loadSearchView = createLoader({ [COURSE_SEARCH_VIEW_KEY]: searchViewParser });

export const courseSearchParamsCache = createSearchParamsCache({
    ...courseSearchParamParsers,
    ...advancedSearchParsers,
    [COURSE_SEARCH_MODE_KEY]: searchModeParser,
    [COURSE_SEARCH_VIEW_KEY]: searchViewParser,
});

function getQueryParams(searchData: CourseSearchParams): WebsocSearchInput {
    return {
        year: searchData.term.year,
        quarter: searchData.term.quarter,
        department: searchData.deptValue,
        ge: searchData.ge,
        courseNumber: searchData.courseNumber,
        sectionCodes: searchData.sectionCode,
        instructorName: searchData.instructor,
        units: searchData.units,
        endTime: searchData.endTime,
        startTime: searchData.startTime,
        fullCourses: searchData.fullCourses,
        building: searchData.building,
        room: searchData.room,
        division: searchData.division,
        excludeRestrictionCodes: searchData.excludeRestrictionCodes,
        days: searchData.days,
    };
}

export function shouldPrefetchCourseSearch(searchParams: Record<string, string | string[] | undefined>) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
        if (Array.isArray(value)) {
            for (const item of value) {
                search.append(key, item);
            }
        } else if (value != null) {
            search.set(key, value);
        }
    }

    const formData = loadCourseSearchParams(search);
    const advancedParams = loadAdvancedSearchParams(search);
    const searchMode = loadSearchMode(search)[COURSE_SEARCH_MODE_KEY];
    const viewParam = loadSearchView(search)[COURSE_SEARCH_VIEW_KEY];
    const manualSearchEnabled = searchMode === COURSE_SEARCH_MODE.MANUAL;
    const { searchFormIsDisplayed } = deriveCourseSearchView(formData, manualSearchEnabled, viewParam);

    if (searchFormIsDisplayed) {
        return null;
    }

    const hasParams = hasManualParams(formData) || hasAdvancedParams(advancedParams);
    if (!hasParams && !isValidSearch(formData)) {
        return null;
    }

    return formData;
}

export async function fetchCourseSearchResults(
    caller: ServerCaller,
    formData: CourseSearchParams,
    multiSearchData: CourseSearchParams[] = []
): Promise<WebsocAPIResponse | null> {
    try {
        if (multiSearchData.length > 0) {
            const { year, quarter } = formData.term;
            const offeredCourses: WebsocSearchInput[] = [];
            const offeredCoursesMapping = await caller.search.filterOfferedCourses({
                term: { year, quarter },
                courses: multiSearchData.map((params) => ({ ...params, department: params.deptValue })),
            });

            for (const course of multiSearchData) {
                if (offeredCoursesMapping[course.deptValue]?.has(course.courseNumber)) {
                    offeredCourses.push(getQueryParams(course));
                }
            }

            return caller.websoc.getMultiple({ params: offeredCourses });
        }

        const websocQueryParams = getQueryParams(formData);
        const selectedGEs = getSelectedGEs(websocQueryParams.ge ?? '');

        if (selectedGEs.length > 1) {
            return intersectWebsocResponses(
                await caller.websoc.getManyOfField({
                    params: { ...websocQueryParams, ge: selectedGEs.join(',') },
                    fieldName: 'ge',
                })
            );
        }

        return caller.websoc.getOne(websocQueryParams);
    } catch (error) {
        console.error('Failed to prefetch course search', error);
        return null;
    }
}

export async function prefetchCourseSearch(
    queryClient: QueryClient,
    caller: ServerCaller,
    searchParams: Record<string, string | string[] | undefined>
) {
    const formData = shouldPrefetchCourseSearch(searchParams);
    if (!formData) {
        return;
    }

    await queryClient.prefetchQuery({
        staleTime: 5 * 60 * 1000,
        queryKey: queryKeys.courseSearch.result(formData, []),
        queryFn: () => fetchCourseSearchResults(caller, formData),
    });
}

export type PrefetchedSchedule = inferRouterOutputs<AppRouter>['schedule']['get'] | null;
