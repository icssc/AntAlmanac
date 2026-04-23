import { SchoolDeptCard } from '$components/RightPane/CoursePane/SchoolDeptCard';
import darkModeLoadingGif from '$components/RightPane/CoursePane/SearchForm/Gifs/dark-loading.gif';
import loadingGif from '$components/RightPane/CoursePane/SearchForm/Gifs/loading.gif';
import darkNoNothing from '$components/RightPane/CoursePane/static/dark-no_results.png';
import noNothing from '$components/RightPane/CoursePane/static/no_results.png';
import RightPaneStore, { CourseSearchParams } from '$components/RightPane/RightPaneStore';
import GeDataFetchProvider from '$components/RightPane/SectionTable/GEDataFetchProvider';
import SectionTableLazyWrapper from '$components/RightPane/SectionTable/SectionTableLazyWrapper';
import WarningAlert from '$components/WarningAlert';
import analyticsEnum from '$lib/analytics/analytics';
import trpc from '$lib/api/trpc';
import { Grades } from '$lib/grades';
import { getLocalStorageRecruitmentDismissalTime, setLocalStorageRecruitmentDismissalTime } from '$lib/localStorage';
import { getTermLongName } from '$lib/termData';
import { WebSOC } from '$lib/websoc';
import { BLUE, PROJECTS_LINK } from '$src/globals';
import AppStore from '$stores/AppStore';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useHoveredStore } from '$stores/HoveredStore';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { Close } from '@mui/icons-material';
import { Alert, Box, IconButton, Link, useTheme } from '@mui/material';
import {
    AACourse,
    AASection,
    WebsocDepartment,
    WebsocSchool,
    WebsocAPIResponse,
    WebsocSectionType,
    GE,
} from '@packages/antalmanac-types';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import LazyLoad from 'react-lazyload';

function getColors() {
    const currentCourses = AppStore.schedule.getCurrentCourses();
    const courseColors = currentCourses.reduce(
        (accumulator, { section }) => {
            accumulator[section.sectionCode] = section.color;
            return accumulator;
        },
        {} as Record<string, string>
    );

    return courseColors;
}

const flattenSOCObject = (SOCObject: WebsocAPIResponse): (WebsocSchool | WebsocDepartment | AACourse)[] => {
    const courseColors = getColors();

    return SOCObject.schools.reduce((accumulator: (WebsocSchool | WebsocDepartment | AACourse)[], school) => {
        accumulator.push(school);

        school.departments.forEach((dept) => {
            accumulator.push(dept);

            dept.courses.forEach((course) => {
                for (const section of course.sections) {
                    (section as AASection).color = courseColors[section.sectionCode];
                }

                const sectionTypesSet = new Set<WebsocSectionType>();

                course.sections.forEach((section) => {
                    sectionTypesSet.add(section.sectionType);
                });

                const sectionTypes = [...sectionTypesSet];

                (course as AACourse).sectionTypes = sectionTypes;

                accumulator.push(course as AACourse);
            });
        });

        return accumulator;
    }, []);
};

function getFilteredCourses(
    allCourses: (WebsocSchool | WebsocDepartment | AACourse)[]
): (WebsocSchool | WebsocDepartment | AACourse)[] {
    const { manualSearchEnabled } = useCoursePaneStore.getState();
    const { filterTakenCourses, userTakenCourses } = useSessionStore.getState();
    if (manualSearchEnabled && filterTakenCourses && userTakenCourses.size > 0) {
        return allCourses.filter((item) => {
            if ('sections' in item && 'deptCode' in item && 'courseNumber' in item) {
                const courseKey = `${item.deptCode}${item.courseNumber}`.replace(/\s+/g, '');
                return !userTakenCourses.has(courseKey);
            }
            return true;
        });
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

/* TODO: all this typecasting in the conditionals is pretty messy, but type guards don't really work in this context
 *  for reasons that are currently beyond me (probably something in the transpiling process that JS doesn't like).
 *  If you can find a way to make this cleaner, do it.
 */
const SectionTableWrapped = (
    index: number,
    data: { scheduleNames: string[]; courseData: (WebsocSchool | WebsocDepartment | AACourse)[] }
) => {
    const { courseData, scheduleNames } = data;
    const formData = RightPaneStore.getFormData();

    let component;

    if ((courseData[index] as WebsocSchool).departments !== undefined) {
        const school = courseData[index] as WebsocSchool;
        component = <SchoolDeptCard comment={school.schoolComment} type={'school'} name={school.schoolName} />;
    } else if ((courseData[index] as WebsocDepartment).courses !== undefined) {
        const dept = courseData[index] as WebsocDepartment;
        component = <SchoolDeptCard name={`Department of ${dept.deptName}`} comment={dept.deptComment} type={'dept'} />;
    } else if (formData.ge !== 'ANY') {
        const course = courseData[index] as AACourse;
        component = (
            <GeDataFetchProvider
                term={formData.term}
                courseDetails={course}
                allowHighlight={true}
                scheduleNames={scheduleNames}
                analyticsCategory={analyticsEnum.classSearch}
            />
        );
    } else {
        const course = courseData[index] as AACourse;
        component = (
            <SectionTableLazyWrapper
                term={formData.term}
                courseDetails={course}
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
            <Image src={isDark ? darkModeLoadingGif : loadingGif} alt="Loading courses" unoptimized />
        </Box>
    );
};

const ErrorMessage = () => {
    const { isDark } = useThemeStore();

    const formData = RightPaneStore.getFormData();
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
            {courseId ? (
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
                src={isDark ? darkNoNothing : noNothing}
                alt="No Results Found"
                style={{ objectFit: 'contain', width: '80%', height: '80%', pointerEvents: 'none' }}
            />
        </Box>
    );
};

export default function CourseRenderPane(props: { id?: number }) {
    const [websocResp, setWebsocResp] = useState<WebsocAPIResponse>();
    const [courseData, setCourseData] = useState<(WebsocSchool | WebsocDepartment | AACourse)[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [scheduleNames, setScheduleNames] = useState(AppStore.getScheduleNames());
    const [unofferedCourses, setUnofferedCourses] = useState<CourseSearchParams[]>([]);
    const [searchedTerm, setSearchedTerm] = useState(() => getTermLongName(RightPaneStore.getFormData().term));

    const setHoveredEvent = useHoveredStore((store) => store.setHoveredEvent);

    const getQueryParams = useCallback((searchData: CourseSearchParams) => {
        const websocQueryParams = {
            department: searchData.deptValue,
            term: searchData.term,
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
            excludeRestrictionCodes: searchData.excludeRestrictionCodes.split('').join(','), // comma delimited string (e.g. ABC -> A,B,C)
            days: searchData.days.split(/(?=[A-Z])/).join(','), // split on capital letters (e.g. MTuF -> M,Tu,F)
        };

        const gradesQueryParams = {
            department: searchData.deptValue,
            ge: searchData.ge as GE,
            instructor: searchData.instructor,
            sectionCode: searchData.sectionCode,
        };

        return { websocQueryParams, gradesQueryParams };
    }, []);

    const queryGrades = useCallback(async (gradesQueryParams: Parameters<typeof Grades.populateGradesCache>[0]) => {
        // Catch the error here so that the course pane still loads even if the grades cache fails to populate
        Grades.populateGradesCache(gradesQueryParams).catch((error) => {
            console.error(error);
            openSnackbar('error', 'Error loading grades information');
        });
    }, []);

    const loadCourses = useCallback(async () => {
        setLoading(true);
        setError(false);

        try {
            const formData = RightPaneStore.getFormData();
            const multiSearchData = RightPaneStore.getMultiSearchData();
            let websocJsonResp;
            if (multiSearchData.length > 0) {
                const [year, quarter] = formData.term.split(' ');
                const offeredCourses: Record<string, string>[] = [];
                const unofferedCourses: CourseSearchParams[] = [];
                const offeredCoursesMapping = await trpc.search.filterOfferedCourses.query({
                    year: year,
                    quarter: quarter,
                    courses: multiSearchData.map((params) => ({ ...params, department: params.deptValue })),
                });
                for (const course of multiSearchData) {
                    if (offeredCoursesMapping[course.deptValue]?.has(course.courseNumber)) {
                        const { websocQueryParams, gradesQueryParams } = getQueryParams(course);
                        offeredCourses.push(websocQueryParams);
                        queryGrades(gradesQueryParams);
                    } else {
                        unofferedCourses.push(course);
                    }
                }
                setUnofferedCourses(unofferedCourses);
                websocJsonResp = await WebSOC.queryMultiple(offeredCourses);
                RightPaneStore.clearMultiSearchData();
            } else {
                const { websocQueryParams, gradesQueryParams } = getQueryParams(formData);
                const [websocJsonResponse, _] = await Promise.all([
                    websocQueryParams.units.includes(',')
                        ? WebSOC.queryMultipleOfField(websocQueryParams, 'units')
                        : WebSOC.query(websocQueryParams),
                    queryGrades(gradesQueryParams),
                ]);
                websocJsonResp = websocJsonResponse;
            }
            setWebsocResp(websocJsonResp);
            const allCourses = flattenSOCObject(websocJsonResp);
            setCourseData(getFilteredCourses(allCourses));
            setSearchedTerm(getTermLongName(RightPaneStore.getFormData().term));
        } catch (error) {
            console.error(error);
            setError(true);
            openSnackbar('error', 'We ran into an error while looking up class info');
        }

        setLoading(false);
    }, []);

    const updateScheduleNames = () => {
        setScheduleNames(AppStore.getScheduleNames());
    };

    useEffect(() => {
        const changeColors = () => {
            if (websocResp == null) {
                return;
            }
            const flattened = flattenSOCObject(websocResp);
            setCourseData(getFilteredCourses(flattened));
        };

        AppStore.on('currentScheduleIndexChange', changeColors);

        return () => {
            AppStore.off('currentScheduleIndexChange', changeColors);
        };
    }, [websocResp]);

    useEffect(() => {
        loadCourses();
        AppStore.on('scheduleNamesChange', updateScheduleNames);

        return () => {
            AppStore.off('scheduleNamesChange', updateScheduleNames);
        };
    }, [loadCourses, props.id]);

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

            {unofferedCourses.map((course) => {
                return (
                    <WarningAlert closable>
                        {course.deptValue} {course.courseNumber} is not offered in {searchedTerm}.
                    </WarningAlert>
                );
            })}
            {loading ? (
                <LoadingMessage />
            ) : error || courseData.length === 0 ? (
                <ErrorMessage />
            ) : (
                <>
                    <RecruitmentBanner />
                    <Box>
                        {courseData.map((_: WebsocSchool | WebsocDepartment | AACourse, index: number) => {
                            let heightEstimate = 200;
                            if ((courseData[index] as AACourse).sections !== undefined)
                                heightEstimate = (courseData[index] as AACourse).sections.length * 60 + 20 + 40;
                            return (
                                <LazyLoad once key={index} overflow height={heightEstimate} offset={1000}>
                                    {SectionTableWrapped(index, {
                                        courseData: courseData,
                                        scheduleNames: scheduleNames,
                                    })}
                                </LazyLoad>
                            );
                        })}
                    </Box>
                </>
            )}
        </>
    );
}
