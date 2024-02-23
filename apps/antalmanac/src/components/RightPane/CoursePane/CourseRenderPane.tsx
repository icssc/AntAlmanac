import { useCallback, useEffect, useState } from 'react';
import LazyLoad from 'react-lazyload';

import { Alert, Box, GlobalStyles, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { AACourse, AASection } from '@packages/antalmanac-types';
import { WebsocDepartment, WebsocSchool, WebsocAPIResponse, GE } from 'peterportal-api-next-types';
import RightPaneStore from '../RightPaneStore';
import GeDataFetchProvider from '../SectionTable/GEDataFetchProvider';
import SectionTableLazyWrapper from '../SectionTable/SectionTableLazyWrapper';
import SchoolDeptCard from './SchoolDeptCard';
import darkModeLoadingGif from './SearchForm/Gifs/dark-loading.gif';
import loadingGif from './SearchForm/Gifs/loading.gif';
import darkNoNothing from './static/dark-no_results.png';
import noNothing from './static/no_results.png';
import AppStore from '$stores/AppStore';
import { useThemeStore } from '$stores/SettingsStore';
import Grades from '$lib/grades';
import analyticsEnum from '$lib/analytics';
import { openSnackbar } from '$actions/AppStoreActions';
import WebSOC from '$lib/websoc';
import { useHoveredStore } from '$stores/HoveredStore';

function getColors() {
    const courseColors = AppStore.schedule.getCurrentCourses().reduce(
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
                accumulator.push(course as AACourse);
            });
        });

        return accumulator;
    }, []);
};
const RecruitmentBanner = () => {
    const [bannerVisibility, setBannerVisibility] = useState(true);

    const isDark = useThemeStore((store) => store.isDark);

    // Display recruitment banner if more than 11 weeks (in ms) has passed since last dismissal
    const recruitmentDismissalTime = window.localStorage.getItem('recruitmentDismissalTime');
    const dismissedRecently =
        recruitmentDismissalTime !== null &&
        Date.now() - parseInt(recruitmentDismissalTime) < 11 * 7 * 24 * 3600 * 1000;
    const isSearchCS = ['COMPSCI', 'IN4MATX', 'I&C SCI', 'STATS'].includes(RightPaneStore.getFormData().deptValue);
    const displayRecruitmentBanner = bannerVisibility && !dismissedRecently && isSearchCS;

    return (
        <Box sx={{ position: 'fixed', bottom: 5, right: 5, zIndex: 999 }}>
            {displayRecruitmentBanner ? (
                <Alert
                    icon={false}
                    severity="info"
                    style={{
                        color: isDark ? '#ece6e6' : '#2e2e2e',
                        backgroundColor: isDark ? '#2e2e2e' : '#ece6e6',
                    }}
                    action={
                        <IconButton
                            aria-label="close"
                            size="small"
                            color="inherit"
                            onClick={() => {
                                window.localStorage.setItem('recruitmentDismissalTime', Date.now().toString());
                                setBannerVisibility(false);
                            }}
                        >
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
                analyticsCategory={analyticsEnum.classSearch.title}
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
                analyticsCategory={analyticsEnum.classSearch.title}
            />
        );
    }

    return <div>{component}</div>;
};

const LoadingMessage = () => {
    const isDark = useThemeStore((store) => store.isDark);
    return (
        <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src={isDark ? darkModeLoadingGif : loadingGif} alt="Loading courses" />
        </Box>
    );
};

const ErrorMessage = () => {
    const isDark = useThemeStore((store) => store.isDark);
    return (
        <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
                src={isDark ? darkNoNothing : noNothing}
                alt="No Results Found"
                style={{ objectFit: 'contain', width: '80%', height: '80%' }}
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

    const setHoveredCourseEvents = useHoveredStore((store) => store.setHoveredCourseEvents);

    const loadCourses = useCallback(async () => {
        setLoading(true);

        const formData = RightPaneStore.getFormData();

        const websocQueryParams = {
            department: formData.deptValue,
            term: formData.term,
            ge: formData.ge,
            courseNumber: formData.courseNumber,
            sectionCodes: formData.sectionCode,
            instructorName: formData.instructor,
            units: formData.units,
            endTime: formData.endTime,
            startTime: formData.startTime,
            fullCourses: formData.coursesFull,
            building: formData.building,
            room: formData.room,
            division: formData.division,
        };

        const gradesQueryParams = {
            department: formData.deptValue,
            ge: formData.ge as GE,
        };

        try {
            // Query websoc for course information and populate gradescache
            const [websocJsonResp, _] = await Promise.all([
                websocQueryParams.units.includes(',')
                    ? WebSOC.queryMultiple(websocQueryParams, 'units')
                    : WebSOC.query(websocQueryParams),
                // Catch the error here so that the course pane still loads even if the grades cache fails to populate
                Grades.populateGradesCache(gradesQueryParams).catch((error) => {
                    console.error(error);
                    openSnackbar('error', 'Error loading grades information');
                }),
            ]);

            setError(false);
            setWebsocResp(websocJsonResp);
            setCourseData(flattenSOCObject(websocJsonResp));
        } catch (error) {
            console.error(error);
            setError(true);
            openSnackbar('error', 'We ran into an error while looking up class info');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateScheduleNames = () => {
        setScheduleNames(AppStore.getScheduleNames());
    };

    useEffect(() => {
        const changeColors = () => {
            if (websocResp == null) {
                return;
            }
            setCourseData(flattenSOCObject(websocResp));
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
            setHoveredCourseEvents(undefined);
        };
    }, [setHoveredCourseEvents]);

    return (
        <>
            {loading ? (
                <LoadingMessage />
            ) : error || courseData.length === 0 ? (
                <ErrorMessage />
            ) : (
                <>
                    <RecruitmentBanner />
                    <Box>
                        <Box sx={{ height: '50px', marginBottom: '5px' }} />
                        <GlobalStyles styles={{ '*::-webkit-scrollbar': { height: '8px' } }} />
                        {courseData.map((_: WebsocSchool | WebsocDepartment | AACourse, index: number) => {
                            let heightEstimate = 200;
                            if ((courseData[index] as AACourse).sections !== undefined)
                                heightEstimate = (courseData[index] as AACourse).sections.length * 60 + 20 + 40;
                            return (
                                <LazyLoad once key={index} overflow height={heightEstimate} offset={500}>
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
