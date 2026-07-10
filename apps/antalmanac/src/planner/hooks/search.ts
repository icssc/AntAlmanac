import { useCallback, useEffect, useRef } from 'react';

import { type FilterOptions, stringifySearchFilters } from '../helpers/searchFilters';
import { transformGQLData } from '../helpers/util';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    searchOperationFailed,
    selectCourseFilters,
    setFirstPageResults,
    setNewPageResults,
    setSearchViewIndex,
} from '../store/slices/searchSlice';
import trpc from '../trpc';
import { type SearchIndex, type SearchResultData } from '../types/types';

const NUM_RESULTS_PER_PAGE = 10;

type SearchResponseData = { count: number; results: SearchResultData; totalRank: number };
async function performSearch(
    index: SearchIndex,
    query: string,
    page: number,
    filters: FilterOptions,
    signal: AbortSignal
): Promise<SearchResponseData> {
    const { stringifiedLevels, stringifiedGeCategories, stringifiedDepartments } = stringifySearchFilters(filters);

    const apiCourseFilters = {
        department: stringifiedDepartments,
        courseLevel: stringifiedLevels,
        ge: stringifiedGeCategories,
    };

    const payload = {
        query,
        take: NUM_RESULTS_PER_PAGE,
        skip: NUM_RESULTS_PER_PAGE * page,
        resultType: index === 'courses' ? 'course' : 'instructor',
        ...(index === 'courses' && apiCourseFilters),
    } as const;

    const response = await trpc.search.get.query(payload, { signal });
    const { count, results } = response ?? { count: 0, results: [] };

    signal.throwIfAborted();

    return {
        count,
        results: results.map((x) => transformGQLData(index, x.result)) as SearchResultData,
        totalRank: results.map((r) => r.rank).reduce((a, b) => a + b, 0),
    };
}

/**
 * automatically initiates a new search and updates the results slice whenever the search query
 * or filters change
 */
export function useSearchTrigger() {
    const inProgressSearch = useAppSelector((state) => state.search.inProgressSearchOperation);
    const visibleSearchIdx = useAppSelector((state) => state.search.viewIndex);

    const searchState = useAppSelector((state) => state.search[visibleSearchIdx]);
    const courseFilters = useAppSelector(selectCourseFilters);
    const showMobileCatalog = useAppSelector((state) => state.roadmap.showMobileCatalog);

    const abortControllerRef = useRef<AbortController | null>(null);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const controller = abortControllerRef.current;
        return () => controller?.abort();
    }, []);

    const regenerateAbortSignal = () => {
        abortControllerRef.current?.abort();
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        return abortController.signal;
    };

    const handleSearchError = useCallback(
        (error: unknown) => {
            // Aborts are expected when a newer search supersedes this one; that newer search owns the
            // in-progress flag, so leave it alone. Any other failure must clear the loading state.
            if (error instanceof Error && error.name === 'AbortError') return;
            console.error('Search error:', error);
            dispatch(searchOperationFailed());
        },
        [dispatch]
    );

    const handleFirstPageResults = useCallback(
        (index: SearchIndex, data: SearchResponseData) => {
            dispatch(setFirstPageResults({ index, ...data }));
        },
        [dispatch]
    );

    useEffect(() => {
        if (inProgressSearch !== 'newQuery') return;

        const signal = regenerateAbortSignal();

        const searches = [performSearch('courses', searchState.query, 0, courseFilters, signal)];
        if (!showMobileCatalog) {
            const instructorSearch = performSearch('instructors', searchState.query, 0, courseFilters, signal);
            searches.push(instructorSearch);
        }

        Promise.all(searches)
            .then(([courseRes, profRes]) => {
                // if a prof search is not triggered, we still want to clear old query results
                profRes ??= { count: 0, results: [], totalRank: 0 };
                handleFirstPageResults('courses', courseRes);
                handleFirstPageResults('instructors', profRes);
                const showCoursesFirst = showMobileCatalog || courseRes.totalRank > profRes.totalRank;
                const eitherHasResults = courseRes.count > 0 || profRes.count > 0;
                if (showMobileCatalog || eitherHasResults) {
                    // don't change if there are no results
                    dispatch(setSearchViewIndex(showCoursesFirst ? 'courses' : 'instructors'));
                }
            })
            .catch(handleSearchError);
    }, [
        handleFirstPageResults,
        handleSearchError,
        inProgressSearch,
        searchState.query,
        courseFilters,
        showMobileCatalog,
        dispatch,
    ]);

    useEffect(() => {
        if (inProgressSearch !== 'newFilters') return;
        if (!searchState.query) return;

        const signal = regenerateAbortSignal();
        const searches = [performSearch('courses', searchState.query, 0, courseFilters, signal)];
        if (!showMobileCatalog) {
            const instructorSearch = performSearch('instructors', searchState.query, 0, courseFilters, signal);
            searches.push(instructorSearch);
        }

        Promise.all(searches)
            .then(([courseRes, profRes]) => {
                profRes ??= { count: 0, results: [], totalRank: 0 };
                handleFirstPageResults('courses', courseRes);
                handleFirstPageResults('instructors', profRes);
                // Filters only narrow courses, so a filter change should keep the user on the course
                // results they're refining. Only fall back to instructors when no course matches.
                const showCourses = showMobileCatalog || courseRes.count > 0;
                const eitherHasResults = courseRes.count > 0 || profRes.count > 0;
                if (showMobileCatalog || eitherHasResults) {
                    dispatch(setSearchViewIndex(showCourses ? 'courses' : 'instructors'));
                }
            })
            .catch(handleSearchError);
    }, [
        courseFilters,
        dispatch,
        handleFirstPageResults,
        handleSearchError,
        inProgressSearch,
        searchState.query,
        showMobileCatalog,
    ]);

    useEffect(() => {
        if (inProgressSearch !== 'newPage') return;

        performSearch(
            visibleSearchIdx,
            searchState.query,
            searchState.pageNumber,
            courseFilters,
            regenerateAbortSignal()
        )
            .then((data) => {
                dispatch(setNewPageResults({ index: visibleSearchIdx, results: data.results }));
            })
            .catch(handleSearchError);
    }, [
        courseFilters,
        dispatch,
        handleSearchError,
        inProgressSearch,
        searchState.pageNumber,
        searchState.query,
        visibleSearchIdx,
    ]);
}
