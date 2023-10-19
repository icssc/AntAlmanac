import { IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import React, { useCallback, useEffect, useState } from 'react';
import LazyLoad from 'react-lazyload';

import { Alert } from '@mui/material';
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

function flattenSOCObject(SOCObject: WebsocAPIResponse): (WebsocSchool | WebsocDepartment | AACourse)[] {
    const courseColors = AppStore.getAddedCourses().reduce((accumulator, { section }) => {
        accumulator[section.sectionCode] = section.color;
        return accumulator;
    }, {} as { [key: string]: string });
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
}
const RecruitmentBanner = () => {
    const [bannerVisibility, setBannerVisibility] = React.useState<boolean>(true);

    // Display recruitment banner if more than 11 weeks (in ms) has passed since last dismissal
    const recruitmentDismissalTime = window.localStorage.getItem('recruitmentDismissalTime');
    const dismissedRecently =
        recruitmentDismissalTime !== null &&
        Date.now() - parseInt(recruitmentDismissalTime) < 11 * 7 * 24 * 3600 * 1000;
    const isSearchCS = ['COMPSCI', 'IN4MATX', 'I&C SCI', 'STATS'].includes(RightPaneStore.getFormData().deptValue);
    const displayRecruitmentBanner = bannerVisibility && !dismissedRecently && isSearchCS;

    return (
        <div style={{ position: 'fixed', bottom: 5, right: 5, zIndex: 999 }}>
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
                            <CloseIcon fontSize="inherit" />
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
            ) : null}{' '}
        </div>
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

export function CourseRenderPane(props: { id?: number }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [scheduleNames, setScheduleNames] = useState(AppStore.getScheduleNames());
    const [courseData, setCourseData] = useState<(WebsocSchool | WebsocDepartment | AACourse)[]>([]);

    const loadCourses = useCallback(async () => {
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
                    ? queryWebsocMultiple(websocQueryParams, 'units')
                    : queryWebsoc(websocQueryParams),
                Grades.populateGradesCache(gradesQueryParams),
            ]);

            setError(false);
            setCourseData(flattenSOCObject(websocJsonResp));
        } catch (error) {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCourses();
    }, [props.id]);

    useEffect(() => {
        const updateScheduleNames = () => {
            setScheduleNames(AppStore.getScheduleNames());
        };

        AppStore.on('scheduleNamesChange', updateScheduleNames);

        return () => {
            AppStore.off('scheduleNamesChange', updateScheduleNames);
        };
    }, []);

    if (loading) {
        return (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <img src={isDarkMode() ? darkModeLoadingGif : loadingGif} alt="Loading courses" />
            </div>
        );
    }

    if (error) {
        return (
            <div
                style={{
                    height: '100%',
                    overflowY: 'scroll',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <img src={isDarkMode() ? darkNoNothing : noNothing} alt="No Results Found" />
                </div>
            </div>
        );
    }

    return (
        <>
            <RecruitmentBanner />
            <div style={{ height: '100%', overflowY: 'scroll', position: 'relative' }}>
                <div style={{ height: '50px', marginBottom: '5px' }} />
                {courseData.length === 0 ? (
                    <div
                        style={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <img src={isDarkMode() ? darkNoNothing : noNothing} alt="No Results Found" />
                    </div>
                ) : (
                    courseData.map((_, index: number) => {
                        let heightEstimate = 200;
                        if ((courseData[index] as AACourse).sections !== undefined)
                            heightEstimate = (courseData[index] as AACourse).sections.length * 60 + 20 + 40;

                        return (
                            <LazyLoad once key={index} overflow height={heightEstimate} offset={500}>
                                {SectionTableWrapped(index, { courseData, scheduleNames })}
                            </LazyLoad>
                        );
                    })
                )}
            </div>
        </>
    );
}

export default CourseRenderPane;
