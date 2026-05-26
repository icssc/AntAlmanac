import { SchoolDeptCard } from '$components/RightPane/CoursePane/SchoolDeptCard';
import { getSelectedGEs } from '$components/RightPane/CoursePane/SearchForm/constants';
import RightPaneStore, { CourseSearchParams, CourseSearchWarningType } from '$components/RightPane/RightPaneStore';
import GeDataFetchProvider from '$components/RightPane/SectionTable/GEDataFetchProvider';
import SectionTable from '$components/RightPane/SectionTable/SectionTable';
import { WarningAlert } from '$components/WarningAlert';
import analyticsEnum from '$lib/analytics/analytics';
import { trpc } from '$lib/api/trpc';
import { getLocalStorageRecruitmentDismissalTime, setLocalStorageRecruitmentDismissalTime } from '$lib/localStorage';
import { BLUE, PROJECTS_LINK } from '$src/globals';
import AppStore from '$stores/AppStore';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useHoveredStore } from '$stores/HoveredStore';
import { usePlannerStore } from '$stores/PlannerStore';
import { useThemeStore } from '$stores/SettingsStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { Close } from '@mui/icons-material';
import { Alert, Box, IconButton, Link, useTheme } from '@mui/material';
import type { WebsocSearchInput } from '@packages/antalmanac-types';
import { AACourse } from '@packages/antalmanac-types';
import { WebsocAPIResponse, WebsocDepartment, WebsocSchool } from '@packages/anteater-api/types';
import { intersectWebsocResponses } from '@packages/anteater-api/utils';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import LazyLoad from 'react-lazyload';

type CourseListEntry = WebsocSchool | WebsocDepartment | AACourse;

function isSchoolEntry(item: CourseListEntry): item is WebsocSchool {
    return 'departments' in item;
}

function isDepartmentEntry(item: CourseListEntry): item is WebsocDepartment {
    return 'courses' in item;
}

function isCourseEntry(item: CourseListEntry): item is AACourse {
    return 'sections' in item && 'deptCode' in item && 'courseNumber' in item;
}

function getColors() {
    const currentCourses = AppStore.schedule.getCurrentCourses();
    const courseColors = currentCourses.reduce<Record<string, string>>((accumulator, { section }) => {
        accumulator[section.sectionCode] = section.color;
        return accumulator;
    }, {});

    return courseColors;
}

const flattenSOCObject = (
    SOCObject: WebsocAPIResponse,
    courseColors: ReturnType<typeof getColors>
): CourseListEntry[] => {
    return SOCObject.schools.reduce((accumulator: CourseListEntry[], school) => {
        accumulator.push(school);

        school.departments.forEach((dept) => {
            accumulator.push(dept);

            dept.courses.forEach((course) => {
                accumulator.push({
                    ...course,
                    sections: course.sections.map((section) => ({
                        ...section,
                        color: courseColors[section.sectionCode],
                    })),
                    sectionTypes: Array.from(new Set(course.sections.map((section) => section.sectionType))),
                });
            });
        });

        return accumulator;
    }, []);
};

function estimateCoursePaneLazyHeight(entry: CourseListEntry): number {
    return isCourseEntry(entry) ? entry.sections.length * 60 + 20 + 40 : 200;
}

function cleanHeaders(items: CourseListEntry[]): CourseListEntry[] {
    const result: CourseListEntry[] = [];
    let pendingSchool: WebsocSchool | null = null;
    let pendingDept: WebsocDepartment | null = null;

    for (const item of items) {
        if (isSchoolEntry(item)) {
            pendingSchool = item;
            pendingDept = null;
        } else if (isDepartmentEntry(item)) {
            pendingDept = item;
        } else {
            if (pendingSchool) {
                result.push(pendingSchool);
                pendingSchool = null;
            }
            if (pendingDept) {
                result.push(pendingDept);
                pendingDept = null;
            }
            result.push(item);
        }
    }

    return result;
}

function getFilteredCourses(allCourses: CourseListEntry[]): CourseListEntry[] {
    const { manualSearchEnabled } = useCoursePaneStore.getState();
    const { filterTakenCourses, userTakenCourses } = usePlannerStore.getState();
    if (manualSearchEnabled && filterTakenCourses && userTakenCourses.size > 0) {
        const filtered = allCourses.filter((item) => {
            if (isCourseEntry(item)) {
                const courseKey = `${item.deptCode}${item.courseNumber}`.replace(/\s+/g, '');
                return !userTakenCourses.has(courseKey);
            }
            return true;
        });
        return cleanHeaders(filtered);
    }
    return allCourses;
}

const RecruitmentBanner = () => {
    const [bannerVisibility, setBannerVisibility] = useState(true);
    const theme = useTheme();

    // Display recruitment banner if more than 11 weeks (in ms) has passed since last dismissal
    const recruitmentDismissalTime = getLocalStorageRecruitmentDismissalTime();
    const dismissedRecently =
        recruitmentDismissalTime !== null &&
        Date.now() - parseInt(recruitmentDismissalTime) < 11 * 7 * 24 * 3600 * 1000;
    const isRelevantDept = ['COMPSCI', 'IN4MATX', 'I&C SCI', 'STATS', 'CSE', 'EECS', 'SWE', 'GDIM', 'COGS'].includes(
        RightPaneStore.getFormData().deptValue.toUpperCase()
    );
    const displayRecruitmentBanner = bannerVisibility && !dismissedRecently && isRelevantDept;

    const handleClick = () => {
        setLocalStorageRecruitmentDismissalTime(Date.now().toString());
        setBannerVisibility(false);
    };

    return (
        <Box
            sx={(theme) => ({
                position: 'fixed',
                bottom: 5,
                right: 5,
                zIndex: theme.zIndex.snackbar,
            })}
        >
            {displayRecruitmentBanner ? (
                <Alert
                    icon={false}
                    severity="info"
                    style={{
                        color: 'unset',
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    action={
                        <IconButton aria-label="close" size="small" color="inherit" onClick={handleClick}>
                            <Close fontSize="inherit" />
                        </IconButton>
                    }
                >
                    Interested in software development?
                    <br />
                    We have opportunities for developers and designers of all skill levels.
                    <br />
                    <a href={PROJECTS_LINK} target="_blank" rel="noopener noreferrer">
                        Join ICSSC and work on AntAlmanac and other projects!
                    </a>
                </Alert>
            ) : null}
        </Box>
    );
};

const SectionTableWrapped = (index: number, data: { scheduleNames: string[]; courseData: CourseListEntry[] }) => {
    const { courseData, scheduleNames } = data;
    const formData = RightPaneStore.getFormData();
    const item = courseData[index];

    let component;

    if (isSchoolEntry(item)) {
        component = <SchoolDeptCard name={item.schoolName} comment={item.schoolComment} type={'school'} />;
    } else if (isDepartmentEntry(item)) {
        component = <SchoolDeptCard name={`Department of ${item.deptName}`} comment={item.deptComment} type={'dept'} />;
    } else if (formData.ge !== 'ANY') {
        component = (
            <GeDataFetchProvider
                term={formData.term}
                courseDetails={item}
                allowHighlight={true}
                scheduleNames={scheduleNames}
                analyticsCategory={analyticsEnum.classSearch}
            />
        );
    } else {
        component = (
            <SectionTable
                term={formData.term}
                courseDetails={item}
                allowHighlight={true}
                scheduleNames={scheduleNames}
                analyticsCategory={analyticsEnum.classSearch}
            />
        );
    }

    return <div>{component}</div>;
};

const LoadingMessage = () => {
    const isDark = useThemeStore((store) => store.isDark);
    return (
        <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Image
                src={isDark ? '/course-search/dark-loading.gif' : '/course-search/loading.gif'}
                alt="Loading courses"
                width={370}
                height={220}
                unoptimized
            />
        </Box>
    );
};

const ErrorMessage = () => {
    const isDark = useThemeStore((store) => store.isDark);

    const formData = RightPaneStore.getFormData();
    const multiSearchData = RightPaneStore.getMultiSearchData();
    const deptValue = formData.deptValue.replace(' ', '').toUpperCase() || null;
    const courseNumber = formData.courseNumber.replace(/\s+/g, '').toUpperCase() || null;
    const courseId = deptValue && courseNumber ? `${deptValue}${courseNumber}` : null;

    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
            }}
        >
            {courseId && multiSearchData.length === 0 ? (
                <Link
                    href={`https://antalmanac.com/planner/course/${encodeURIComponent(courseId)}`}
                    target="_blank"
                    sx={{ width: '100%' }}
                >
                    <Alert
                        variant="filled"
                        severity="info"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: 14,
                            backgroundColor: BLUE,
                            color: 'white',
                        }}
                    >
                        <span>
                            Search for{' '}
                            <span style={{ textDecoration: 'underline' }}>
                                {deptValue} {courseNumber}
                            </span>{' '}
                            on AntAlmanac Planner!
                        </span>
                    </Alert>
                </Link>
            ) : null}

            <Image
                src={isDark ? '/course-search/dark-no-results.png' : '/course-search/no-results.png'}
                width={601}
                height={422}
                alt="No Results Found"
                style={{ objectFit: 'contain', width: '80%', height: '80%', pointerEvents: 'none' }}
            />
        </Box>
    );
};

export default function CourseRenderPane(props: { id?: number }) {
    const [courseColors, setCourseColors] = useState(getColors);
    const [scheduleNames, setScheduleNames] = useState(() => AppStore.getScheduleNames());
    const [unofferedCourses, setUnofferedCourses] = useState<CourseSearchParams[]>([]);
    const [searchedTerm, setSearchedTerm] = useState(() => RightPaneStore.getFormData().term.longName);

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
        queryKey: ['searchResults', RightPaneStore.getFormData(), RightPaneStore.getMultiSearchData()],
        queryFn: async (): Promise<WebsocAPIResponse | null> => {
            setUnofferedCourses([]);

            try {
                const multiSearchData = RightPaneStore.getMultiSearchData();
                let response: WebsocAPIResponse;

                if (multiSearchData.length > 0) {
                    const { year, quarter } = RightPaneStore.getFormData().term;
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
                    const websocQueryParams = getQueryParams(RightPaneStore.getFormData());
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

                setSearchedTerm(RightPaneStore.getFormData().term.longName);
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
        return getFilteredCourses(flattenSOCObject(searchResponse, courseColors));
    }, [searchResponse, courseColors]);

    const updateScheduleNames = () => {
        setScheduleNames(AppStore.getScheduleNames());
    };

    const hasRenderableCourseResults = courseData.some(isCourseEntry);

    useEffect(() => {
        const changeColors = () => {
            setCourseColors(getColors());
        };

        AppStore.on('scheduleNamesChange', updateScheduleNames);
        AppStore.on('currentScheduleIndexChange', changeColors);

        return () => {
            AppStore.off('scheduleNamesChange', updateScheduleNames);
            AppStore.off('currentScheduleIndexChange', changeColors);
        };
    }, [props.id]);

    /**
     * Removes hovered course when component unmounts
     * Handles edge cases where the Section Table is removed, rather than the mouse
     * ex: Swapping to the Added tab, clicking the LocationCell link
     */
    useEffect(() => {
        return () => {
            setHoveredEvent(undefined);
        };
    }, [setHoveredEvent]);

    return (
        <>
            <Box sx={{ height: '56px' }} />

            {Object.entries(RightPaneStore.getWarningMessages()).map(([warningType, messages]) => {
                return messages.map((message) => (
                    <WarningAlert
                        closable
                        key={`${warningType}${message}`}
                        onClose={() =>
                            RightPaneStore.removeWarningMessage(warningType as CourseSearchWarningType, message)
                        }
                    >
                        {message}
                    </WarningAlert>
                ));
            })}
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
                <ErrorMessage />
            ) : (
                <>
                    <RecruitmentBanner />
                    <Box>
                        {courseData.map((data, index) => (
                            <LazyLoad
                                once
                                key={index}
                                overflow
                                height={estimateCoursePaneLazyHeight(data)}
                                offset={1000}
                            >
                                {SectionTableWrapped(index, {
                                    courseData,
                                    scheduleNames,
                                })}
                            </LazyLoad>
                        ))}
                    </Box>
                </>
            )}
        </>
    );
}
