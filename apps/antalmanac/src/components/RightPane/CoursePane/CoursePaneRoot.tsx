import { CoursePaneButtonRow } from '$components/RightPane/CoursePane/CoursePaneButtonRow';
import CourseRenderPane from '$components/RightPane/CoursePane/CourseRenderPane';
import { PLANNER_SEARCH_PARAM } from '$components/RightPane/CoursePane/SearchForm/constants';
import { SearchForm } from '$components/RightPane/CoursePane/SearchForm/SearchForm';
import {
    courseSearchFormDataHasAdvancedSearch,
    courseSearchFormDataHasManualSearch,
    courseSearchFormDataHasRequiredSearchParams,
    courseSearchFormDataIsValid,
    useCourseSearchUrlState,
} from '$components/RightPane/CoursePane/SearchForm/searchParams';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { trpcReact } from '$lib/api/trpc';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { Box } from '@mui/material';
import { parseAsString, useQueryState } from 'nuqs';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

export function CoursePaneRoot() {
    const { key, forceUpdate, searchFormIsDisplayed, displaySearch, displaySections, initializeSearchUi } =
        useCoursePaneStore(
            useShallow((store) => ({
                key: store.key,
                forceUpdate: store.forceUpdate,
                searchFormIsDisplayed: store.searchFormIsDisplayed,
                displaySearch: store.displaySearch,
                displaySections: store.displaySections,
                initializeSearchUi: store.initializeSearchUi,
            }))
        );
    const { formData } = useCourseSearchUrlState();
    const [plannerSearchParam] = useQueryState(PLANNER_SEARCH_PARAM, parseAsString.withOptions({ history: 'replace' }));
    const postHog = usePostHog();
    const utils = trpcReact.useUtils();
    const hasInitializedSearchUi = useRef(false);

    const handleSearch = useCallback(() => {
        if (courseSearchFormDataIsValid(formData)) {
            displaySections();
            forceUpdate();
        } else {
            openSnackbar(
                'error',
                `Please provide one of the following: Department, GE, Section Code/Range, or Instructor`
            );
        }
    }, [displaySections, forceUpdate, formData]);

    const handleDisplaySearch = useCallback(() => {
        displaySearch();
    }, [displaySearch]);

    const refreshSearch = useCallback(() => {
        logAnalytics(postHog, {
            category: analyticsEnum.classSearch,
            action: analyticsEnum.classSearch.actions.REFRESH,
        });
        utils.websoc.invalidate();
        utils.grades.invalidate();
        forceUpdate();
    }, [forceUpdate, postHog, utils]);

    const handleKeydown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleDisplaySearch();
        },
        [handleDisplaySearch]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeydown, false);

        return () => {
            document.removeEventListener('keydown', handleKeydown, false);
        };
    }, [handleKeydown]);

    useEffect(() => {
        if (hasInitializedSearchUi.current) {
            return;
        }

        initializeSearchUi({
            searchFormIsDisplayed:
                !courseSearchFormDataHasRequiredSearchParams(formData) || !courseSearchFormDataIsValid(formData),
            manualSearchEnabled: courseSearchFormDataHasManualSearch(formData) && plannerSearchParam === null,
            advancedSearchEnabled: courseSearchFormDataHasAdvancedSearch(formData),
        });
        hasInitializedSearchUi.current = true;
    }, [formData, initializeSearchUi, plannerSearchParam]);

    return (
        <Box sx={{ height: 0, flexGrow: 1 }}>
            <CoursePaneButtonRow
                showSearch={!searchFormIsDisplayed}
                onDismissSearchResults={handleDisplaySearch}
                onRefreshSearch={refreshSearch}
            />
            {searchFormIsDisplayed ? (
                <SearchForm toggleSearch={handleSearch} />
            ) : (
                <CourseRenderPane key={key} id={key} />
            )}
        </Box>
    );
}
