import { CoursePaneButtonRow } from '$components/RightPane/CoursePane/CoursePaneButtonRow';
import { CourseListItem } from '$components/RightPane/CoursePane/CourseRenderPane/CourseList/CourseListItem';
import {
    estimateCoursePaneLazyHeight,
    flattenSOCObject,
    getCourseColors,
    getFilteredCourses,
    isCourseEntry,
} from '$components/RightPane/CoursePane/CourseRenderPane/CourseList/helpers';
import { LoadingMessage } from '$components/RightPane/CoursePane/CourseRenderPane/LoadingMessage';
import { NoResults } from '$components/RightPane/CoursePane/CourseRenderPane/NoResults';
import { RecruitmentBanner } from '$components/RightPane/CoursePane/CourseRenderPane/RecruitmentBanner';
import { getSelectedGEs } from '$components/RightPane/CoursePane/SearchForm/constants';
import { useCourseSearchForm, useCourseSearchMode } from '$components/RightPane/CoursePane/SearchParams/hooks';
import type { CourseSearchParams } from '$components/RightPane/CoursePane/SearchParams/types';
import { WarningAlert } from '$components/WarningAlert';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { trpc, trpcReact } from '$lib/api/trpc';
import { queryKeys } from '$lib/queryKeys';
import AppStore from '$stores/AppStore';
import { useHoveredStore } from '$stores/HoveredStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { Box } from '@mui/material';
import type { WebsocSearchInput } from '@packages/antalmanac-types';
import type { WebsocAPIResponse } from '@packages/anteater-api/types';
import { flattenCourses, intersectWebsocResponses, unionWebsocResponses } from '@packages/anteater-api/utils';
import { useQuery } from '@tanstack/react-query';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import LazyLoad from 'react-lazyload';

interface CourseRenderPaneProps {
    onDismissSearchResults: () => void;
}

export function CourseRenderPane({ onDismissSearchResults }: CourseRenderPaneProps) {
    const postHog = usePostHog();
    const utils = trpcReact.useUtils();

    const { formData } = useCourseSearchForm();
    const { manualSearchEnabled } = useCourseSearchMode();

    const [courseColors, setCourseColors] = useState(() => getCourseColors());
    const [scheduleNames, setScheduleNames] = useState(() => AppStore.getScheduleNames());

    const setHoveredEvent = useHoveredStore((store) => store.setHoveredEvent);

    const getQueryParams = useCallback(
        (searchData: CourseSearchParams): WebsocSearchInput => ({
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
        }),
        []
    );

    const {
        data: searchResponse,
        isFetching,
        isError,
        refetch,
    } = useQuery({
        staleTime: 5 * 60 * 1000,
        queryKey: queryKeys.courseSearch.result(formData),
        queryFn: async (): Promise<WebsocAPIResponse | null> => {
            try {
                const websocQueryParams = getQueryParams(formData);
                let response: WebsocAPIResponse;

                if (formData.courseIds.length > 0) {
                    response = unionWebsocResponses(
                        await trpc.websoc.getManyOfField.query({
                            params: websocQueryParams,
                            fieldName: 'courseId',
                            values: formData.courseIds,
                        })
                    );
                } else {
                    const selectedGEs = getSelectedGEs(websocQueryParams.ge ?? '');
                    response =
                        selectedGEs.length > 1
                            ? intersectWebsocResponses(
                                  await trpc.websoc.getManyOfField.query({
                                      params: websocQueryParams,
                                      fieldName: 'ge',
                                      values: selectedGEs,
                                  })
                              )
                            : await trpc.websoc.getOne.query(websocQueryParams);
                }

                return response;
            } catch (error) {
                console.error(error);
                openSnackbar('error', 'We ran into an error while looking up class info');
                return null;
            }
        },
    });

    const refreshSearch = useCallback(() => {
        logAnalytics(postHog, {
            category: analyticsEnum.classSearch,
            action: analyticsEnum.classSearch.actions.REFRESH,
        });
        void refetch();
        utils.websoc.invalidate();
        utils.grades.invalidate();
    }, [postHog, refetch, utils]);

    const unofferedCourseIds = useMemo(() => {
        if (!searchResponse || formData.courseIds.length === 0) return [];
        const returnedIds = new Set(flattenCourses(searchResponse).map((c) => c.courseId));
        return formData.courseIds.filter((id) => !returnedIds.has(id));
    }, [searchResponse, formData.courseIds]);

    const courseData = useMemo(() => {
        if (!searchResponse) {
            return [];
        }

        return getFilteredCourses(flattenSOCObject(searchResponse, formData.term, courseColors), manualSearchEnabled);
    }, [searchResponse, formData.term, courseColors, manualSearchEnabled]);

    const updateScheduleNames = () => {
        setScheduleNames(AppStore.getScheduleNames());
    };

    const hasRenderableCourseResults = courseData.some(isCourseEntry);

    useEffect(() => {
        const changeColors = () => {
            setCourseColors(getCourseColors());
        };

        AppStore.on('scheduleNamesChange', updateScheduleNames);
        AppStore.on('currentScheduleIndexChange', changeColors);

        return () => {
            AppStore.off('scheduleNamesChange', updateScheduleNames);
            AppStore.off('currentScheduleIndexChange', changeColors);
        };
    }, []);

    useEffect(() => {
        return () => {
            setHoveredEvent(undefined);
        };
    }, [setHoveredEvent]);

    return (
        <>
            <CoursePaneButtonRow onDismissSearchResults={onDismissSearchResults} onRefreshSearch={refreshSearch} />
            <Box sx={{ height: '56px' }} />

            {unofferedCourseIds.map((id) => (
                <WarningAlert closable key={id}>
                    {id} is not offered in {formData.term.longName}.
                </WarningAlert>
            ))}
            {isFetching ? (
                <LoadingMessage />
            ) : isError || !hasRenderableCourseResults ? (
                <NoResults formData={formData} />
            ) : (
                <>
                    <RecruitmentBanner deptValue={formData.deptValue} />
                    <Box>
                        {courseData.map((data, index) => (
                            <LazyLoad
                                once
                                key={index}
                                overflow
                                height={estimateCoursePaneLazyHeight(data)}
                                offset={1000}
                            >
                                <CourseListItem item={data} scheduleNames={scheduleNames} formData={formData} />
                            </LazyLoad>
                        ))}
                    </Box>
                </>
            )}
        </>
    );
}
