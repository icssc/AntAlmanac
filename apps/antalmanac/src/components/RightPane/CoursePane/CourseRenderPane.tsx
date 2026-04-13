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
import { useQueryStates } from 'nuqs';
import { useCallback, useEffect, useRef, useState } from 'react';
import LazyLoad from 'react-lazyload';

import { SchoolDeptCard } from '$components/RightPane/CoursePane/SchoolDeptCard';
import darkModeLoadingGif from '$components/RightPane/CoursePane/SearchForm/Gifs/dark-loading.gif';
import loadingGif from '$components/RightPane/CoursePane/SearchForm/Gifs/loading.gif';
import darkNoNothing from '$components/RightPane/CoursePane/static/dark-no_results.png';
import noNothing from '$components/RightPane/CoursePane/static/no_results.png';
import GeDataFetchProvider from '$components/RightPane/SectionTable/GEDataFetchProvider';
import SectionTableLazyWrapper from '$components/RightPane/SectionTable/SectionTableLazyWrapper';
import { useIsMobile } from '$hooks/useIsMobile';
import analyticsEnum from '$lib/analytics/analytics';
import { Grades } from '$lib/grades';
import { getLocalStorageRecruitmentDismissalTime, setLocalStorageRecruitmentDismissalTime } from '$lib/localStorage';
import { type SearchFormData, searchParsers } from '$lib/searchParams';
import { WebSOC } from '$lib/websoc';
import { BLUE } from '$src/globals';
import AppStore from '$stores/AppStore';
import { useHoveredStore } from '$stores/HoveredStore';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';
import { openSnackbar } from '$stores/SnackbarStore';

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
    allCourses: (WebsocSchool | WebsocDepartment | AACourse)[],
    mode: string
): (WebsocSchool | WebsocDepartment | AACourse)[] {
    const { filterTakenCourses, userTakenCourses } = useSessionStore.getState();
    if (mode === 'manual' && filterTakenCourses && userTakenCourses.size > 0) {
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

const RecruitmentBanner = ({ formData }: { formData: SearchFormData }) => {
    const [bannerVisibility, setBannerVisibility] = useState(true);
    const isMobile = useIsMobile();
    const theme = useTheme();

    const recruitmentDismissalTime = getLocalStorageRecruitmentDismissalTime();
    const dismissedRecently =
        recruitmentDismissalTime !== null &&
        Date.now() - parseInt(recruitmentDismissalTime) < 11 * 7 * 24 * 3600 * 1000;
    const isSearchCS = ['COMPSCI', 'IN4MATX', 'I&C SCI', 'STATS'].includes(formData.deptValue.toUpperCase());
    const displayRecruitmentBanner = bannerVisibility && !dismissedRecently && isSearchCS;

    const handleClick = () => {
        setLocalStorageRecruitmentDismissalTime(Date.now().toString());
        setBannerVisibility(false);
    };

    return (
        <Box
            sx={(theme) => ({
                position: 'fixed',
                bottom: 5,
                right: isMobile ? 5 : 75,
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
                    Interested in web development?
                    <br />
                    <a href="https://forms.gle/v32Cx65vwhnmxGPv8" target="__blank" rel="noopener noreferrer">
                        Join ICSSC and work on AntAlmanac and other projects!
                    </a>
                    <br />
                    We have opportunities for experienced devs and those with zero experience!
                </Alert>
            ) : null}
        </Box>
    );
};

const SectionTableWrapped = (
    index: number,
    data: {
        scheduleNames: string[];
        courseData: (WebsocSchool | WebsocDepartment | AACourse)[];
        formData: SearchFormData;
    }
) => {
    const { courseData, scheduleNames, formData } = data;

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

const ErrorMessage = ({ formData }: { formData: SearchFormData }) => {
    const { isDark } = useThemeStore();

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
    const [formData] = useQueryStates(searchParsers);
    const formDataRef = useRef(formData);
    formDataRef.current = formData;

    const [websocResp, setWebsocResp] = useState<WebsocAPIResponse>();
    const [courseData, setCourseData] = useState<(WebsocSchool | WebsocDepartment | AACourse)[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [scheduleNames, setScheduleNames] = useState(AppStore.getScheduleNames());

    const setHoveredEvent = useHoveredStore((store) => store.setHoveredEvent);

    const loadCourses = useCallback(async () => {
        const data = formDataRef.current;
        setLoading(true);

        const websocQueryParams = {
            department: data.deptValue,
            term: data.term,
            ge: data.ge,
            courseNumber: data.courseNumber,
            sectionCodes: data.sectionCode,
            instructorName: data.instructor,
            units: data.units,
            endTime: data.endTime,
            startTime: data.startTime,
            fullCourses: data.coursesFull,
            building: data.building,
            room: data.room,
            division: data.division,
            excludeRestrictionCodes: data.excludeRestrictionCodes.split('').join(','),
            days: data.days.split(/(?=[A-Z])/).join(','),
        };

        const gradesQueryParams = {
            department: data.deptValue,
            ge: data.ge as GE,
            instructor: data.instructor,
            sectionCode: data.sectionCode,
        };

        try {
            const [websocJsonResp, _] = await Promise.all([
                websocQueryParams.units.includes(',')
                    ? WebSOC.queryMultiple(websocQueryParams, 'units')
                    : WebSOC.query(websocQueryParams),
                Grades.populateGradesCache(gradesQueryParams).catch((error) => {
                    console.error(error);
                    openSnackbar('error', 'Error loading grades information');
                }),
            ]);

            setError(false);
            setWebsocResp(websocJsonResp);
            const allCourses = flattenSOCObject(websocJsonResp);
            setCourseData(getFilteredCourses(allCourses, data.mode));
        } catch (error) {
            console.error(error);
            setError(true);
            openSnackbar('error', 'We ran into an error while looking up class info');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            setCourseData(getFilteredCourses(flattened, formData.mode));
        };

        AppStore.on('currentScheduleIndexChange', changeColors);

        return () => {
            AppStore.off('currentScheduleIndexChange', changeColors);
        };
    }, [websocResp, formData.mode]);

    useEffect(() => {
        loadCourses();
        AppStore.on('scheduleNamesChange', updateScheduleNames);

        return () => {
            AppStore.off('scheduleNamesChange', updateScheduleNames);
        };
    }, [loadCourses, props.id]);

    useEffect(() => {
        return () => {
            setHoveredEvent(undefined);
        };
    }, [setHoveredEvent]);

    return (
        <>
            <Box sx={{ height: '56px' }} />

            {loading ? (
                <LoadingMessage />
            ) : error || courseData.length === 0 ? (
                <ErrorMessage formData={formData} />
            ) : (
                <>
                    <RecruitmentBanner formData={formData} />
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
                                        formData: formData,
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
