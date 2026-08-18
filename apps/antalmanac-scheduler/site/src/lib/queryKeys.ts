import { serializeCourseSearchParams } from '$components/RightPane/CoursePane/SearchParams/parsers';
import type { CourseSearchParams } from '$components/RightPane/CoursePane/SearchParams/types';

function serializeMultiSearchData(multiSearchData: CourseSearchParams[]) {
    if (multiSearchData.length === 0) {
        return '';
    }

    return multiSearchData
        .map((course) => `${course.deptValue}:${course.courseNumber}`)
        .sort()
        .join('|');
}

/**
 * TanStack Query keys for queries that are not managed by tRPC React Query hooks.
 *
 * tRPC procedures use auto-generated keys via `trpcReact.*.useQuery`; add entries here
 * when using raw `useQuery` or when invalidating outside tRPC utils.
 *
 * @see https://tkdodo.eu/blog/effective-react-query-keys
 */
export const queryKeys = {
    courseSearch: {
        all: ['courseSearch'] as const,
        results: () => [...queryKeys.courseSearch.all, 'results'] as const,
        result: (formData: CourseSearchParams, multiSearchData: CourseSearchParams[]) =>
            [
                ...queryKeys.courseSearch.results(),
                serializeCourseSearchParams(formData) ?? '',
                serializeMultiSearchData(multiSearchData),
            ] as const,
    },
} as const;
