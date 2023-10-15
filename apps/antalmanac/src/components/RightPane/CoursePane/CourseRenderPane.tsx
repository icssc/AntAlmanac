import { useCallback, useEffect, useState } from 'react';
import LazyLoad from 'react-lazyload';

import { Alert, Box, IconButton } from '@mui/material';
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
import { isDarkMode, queryWebsoc, queryWebsocMultiple } from '$lib/helpers';
import Grades from '$lib/grades';
import analyticsEnum from '$lib/analytics';

function getColors() {
    const courseColors = AppStore.schedule.getCurrentCourses().reduce((accumulator, { section }) => {
        accumulator[section.sectionCode] = section.color;
        return accumulator;
    }, {} as { [key: string]: string });

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
                        color: isDarkMode() ? '#ece6e6' : '#2e2e2e',
                        backgroundColor: isDarkMode() ? '#2e2e2e' : '#ece6e6',
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

const ErrorMessage = () => {
    return (
        <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
                src={isDarkMode() ? darkNoNothing : noNothing}
                alt="No Results Found"
                style={{ objectFit: 'contain', width: '80%', height: '80%' }}
            />
        </Box>
    );
};

export default function CourseRenderPane() {
    const [websocResp, setWebsocResp] = useState<WebsocAPIResponse>();
    const [courseData, setCourseData] = useState<(WebsocSchool | WebsocDepartment | AACourse)[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [scheduleNames, setScheduleNames] = useState(AppStore.getScheduleNames());

    const loadCourses = async () => {
        setLoading(true);

        const formData = RightPaneStore.getFormData();

        const params = {
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

        try {
            let jsonResp;
            if (params.units.includes(',')) {
                jsonResp = await queryWebsocMultiple(params, 'units');
            } else {
                jsonResp = await queryWebsoc(params);
            }
            setLoading(false);
            setError(false);
            setWebsocResp(jsonResp);
            setCourseData(flattenSOCObject(jsonResp));
        } catch (error) {
            setLoading(false);
            setError(true);
        }
    };

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
    }, []);

    return (
        <>
            {loading ? (
                <Box
                    sx={{
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <img src={isDarkMode() ? darkModeLoadingGif : loadingGif} alt="Loading courses" />
                </Box>
            ) : error || courseData.length === 0 ? (
                <ErrorMessage />
            ) : (
                <>
                    <RecruitmentBanner />
                    <Box>
                        <Box sx={{ height: '50px', marginBottom: '5px' }} />
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
