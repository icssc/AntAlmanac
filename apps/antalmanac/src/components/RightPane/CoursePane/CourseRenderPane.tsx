import { Close } from '@mui/icons-material';
import { Alert, Box, IconButton, useMediaQuery } from '@mui/material';
import { AACourse, AASection, WebsocDepartment, WebsocSchool, WebsocAPIResponse, GE } from '@packages/antalmanac-types';
import { useCallback, useEffect, useState } from 'react';
import LazyLoad from 'react-lazyload';

import { openSnackbar } from '$actions/AppStoreActions';
import { ErrorMessage } from '$components/RightPane/CoursePane/messages/ErrorMessage';
import { LoadingMessage } from '$components/RightPane/CoursePane/messages/LoadingMessage';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { SectionTableWrapped } from '$components/RightPane/SectionTable/SectionTableWrapped';
import { Grades } from '$lib/grades';
import { getLocalStorageRecruitmentDismissalTime, setLocalStorageRecruitmentDismissalTime } from '$lib/localStorage';
import { WebSOC } from '$lib/websoc';
import AppStore from '$stores/AppStore';
import { useHoveredStore } from '$stores/HoveredStore';
import { useThemeStore } from '$stores/SettingsStore';

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
    const recruitmentDismissalTime = getLocalStorageRecruitmentDismissalTime();
    const dismissedRecently =
        recruitmentDismissalTime !== null &&
        Date.now() - parseInt(recruitmentDismissalTime) < 11 * 7 * 24 * 3600 * 1000;
    const isSearchCS = ['COMPSCI', 'IN4MATX', 'I&C SCI', 'STATS'].includes(
        RightPaneStore.getFormData().deptValue.toUpperCase()
    );
    const displayRecruitmentBanner = bannerVisibility && !dismissedRecently && isSearchCS;

    const isMobileScreen = useMediaQuery('(max-width: 750px)');

    return (
        <Box sx={{ position: 'fixed', bottom: 5, right: isMobileScreen ? 5 : 75, zIndex: 999 }}>
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
                                setLocalStorageRecruitmentDismissalTime(Date.now().toString());
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

export default function CourseRenderPane(props: { id?: number }) {
    const [websocResp, setWebsocResp] = useState<WebsocAPIResponse>();
    const [courseData, setCourseData] = useState<(WebsocSchool | WebsocDepartment | AACourse)[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [scheduleNames, setScheduleNames] = useState(AppStore.getScheduleNames());

    const setHoveredEvent = useHoveredStore((store) => store.setHoveredEvent);

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
            excludeRestrictionCodes: formData.excludeRestrictionCodes.split('').join(','), // comma delimited string (e.g. ABC -> A,B,C)
        };

        const gradesQueryParams = {
            department: formData.deptValue,
            ge: formData.ge as GE,
            instructor: formData.instructor,
            sectionCode: formData.sectionCode,
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
            setHoveredEvent(undefined);
        };
    }, [setHoveredEvent]);

    if (loading) {
        return <LoadingMessage />;
    }

    if (error || courseData.length === 0) {
        return <ErrorMessage />;
    }

    return (
        <>
            <Box sx={{ height: '56px' }} />

            <RecruitmentBanner />
            <Box>
                {courseData.map((_: WebsocSchool | WebsocDepartment | AACourse, index: number) => {
                    const heightEstimate =
                        (courseData[index] as AACourse).sections !== undefined
                            ? (courseData[index] as AACourse).sections.length * 60 + 20 + 40
                            : 200;

                    return (
                        <LazyLoad once key={index} overflow height={heightEstimate} offset={500}>
                            {SectionTableWrapped({
                                index: index,
                                courseData: courseData,
                                scheduleNames: scheduleNames,
                            })}
                        </LazyLoad>
                    );
                })}
            </Box>
        </>
    );
}
