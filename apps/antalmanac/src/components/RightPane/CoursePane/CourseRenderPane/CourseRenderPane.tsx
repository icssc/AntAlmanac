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
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { WarningAlert } from '$components/WarningAlert';
import { trpc } from '$lib/api/trpc';
import AppStore from '$stores/AppStore';
import { useHoveredStore } from '$stores/HoveredStore';
import { usePlannerStore } from '$stores/PlannerStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { Box } from '@mui/material';
import type { WebsocSearchInput } from '@packages/antalmanac-types';
import type { WebsocAPIResponse } from '@packages/anteater-api/types';
import { intersectWebsocResponses } from '@packages/anteater-api/utils';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import LazyLoad from 'react-lazyload';

export function CourseRenderPane() {
    const { formData } = useCourseSearchForm();
    const { manualSearchEnabled } = useCourseSearchMode();
    const [courseColors, setCourseColors] = useState(getCourseColors);
    const [scheduleNames, setScheduleNames] = useState(() => AppStore.getScheduleNames());
    const [unofferedCourses, setUnofferedCourses] = useState<CourseSearchParams[]>([]);
    const [searchedTerm, setSearchedTerm] = useState(() => formData.term.longName);
    const multiSearchData = RightPaneStore.getMultiSearchData();

    const setHoveredEvent = useHoveredStore((store) => store.setHoveredEvent);
    const filterTakenCourses = usePlannerStore((store) => store.filterTakenCourses);

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
            fullCourses: searchData.coursesFull,
            building: searchData.building,
            room: searchData.room,
            division: searchData.division,
            excludeRestrictionCodes: searchData.excludeRestrictionCodes.split('').join(','),
            days: searchData.days.split(/(?=[A-Z])/).join(','),
        }),
        []
    );

    const {
        data: searchResponse,
        isLoading,
        isError,
    } = useQuery({
        staleTime: 5 * 60 * 1000,
        queryKey: ['searchResults', formData, multiSearchData],
        queryFn: async (): Promise<WebsocAPIResponse | null> => {
            setUnofferedCourses([]);

            try {
                const multiSearchData = RightPaneStore.getMultiSearchData();
                let response: WebsocAPIResponse;

                if (multiSearchData.length > 0) {
                    const { year, quarter } = formData.term;
                    const offeredCourses: WebsocSearchInput[] = [];
                    const nextUnoffered: CourseSearchParams[] = [];
                    const offeredCoursesMapping = await trpc.search.filterOfferedCourses.query({
                        term: { year, quarter },
                        courses: multiSearchData.map((params) => ({ ...params, department: params.deptValue })),
                    });
                    for (const course of multiSearchData) {
                        if (offeredCoursesMapping[course.deptValue]?.has(course.courseNumber)) {
                            offeredCourses.push(getQueryParams(course));
                        } else {
                            nextUnoffered.push(course);
                        }
                    }
                    setUnofferedCourses(nextUnoffered);
                    response = await trpc.websoc.getMultiple.query({ params: offeredCourses });
                } else {
                    const websocQueryParams = getQueryParams(formData);
                    const selectedGEs = getSelectedGEs(websocQueryParams.ge ?? '');
                    response =
                        selectedGEs.length > 1
                            ? intersectWebsocResponses(
                                  await trpc.websoc.getManyOfField.query({
                                      params: { ...websocQueryParams, ge: selectedGEs.join(',') },
                                      fieldName: 'ge',
                                  })
                              )
                            : await trpc.websoc.getOne.query(websocQueryParams);
                }

                setSearchedTerm(formData.term.longName);
                return response;
            } catch (error) {
                console.error(error);
                openSnackbar('error', 'We ran into an error while looking up class info');
                return null;
            }
        },
    });

    const courseData = useMemo(() => {
        if (!searchResponse) {
            return [];
        }

        return getFilteredCourses(flattenSOCObject(searchResponse, courseColors), manualSearchEnabled);
    }, [searchResponse, courseColors, manualSearchEnabled]);

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
            <Box sx={{ height: '56px' }} />

            {filterTakenCourses && !hasRenderableCourseResults && (
                <WarningAlert>Filtered taken courses is toggled.</WarningAlert>
            )}
            {unofferedCourses.map((course) => {
                return (
                    <WarningAlert closable key={`${course.deptValue}${course.courseNumber}`}>
                        {course.deptValue} {course.courseNumber} is not offered in {searchedTerm}.
                    </WarningAlert>
                );
            })}
            {isLoading ? (
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
