import { Box } from '@mui/material';
import {
    AACourse,
    AASection,
    WebsocDepartment,
    WebsocSchool,
    WebsocAPIResponse,
    GE,
    LarcAPIResponse,
} from '@packages/antalmanac-types';
import { useCallback, useEffect, useState } from 'react';
import LazyLoad from 'react-lazyload';

import RightPaneStore from '../RightPaneStore';

import { openSnackbar } from '$actions/AppStoreActions';
import { ErrorMessage } from '$components/RightPane/CoursePane/Messages/ErrorMessage';
import { LoadingMessage } from '$components/RightPane/CoursePane/Messages/LoadingMessage';
import { RecruitmentBanner } from '$components/RightPane/CoursePane/RecruitmentBanner';
import { SectionTableWrapped } from '$components/RightPane/SectionTable/SectionTableWrapped';
import { Grades } from '$lib/grades';
import { Larc } from '$lib/larc';
import { WebSOC } from '$lib/websoc';
import AppStore from '$stores/AppStore';
import { useHoveredStore } from '$stores/HoveredStore';

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

export default function CourseRenderPane(props: { id?: number }) {
    const [websocResp, setWebsocResp] = useState<WebsocAPIResponse>();
    const [courseData, setCourseData] = useState<(WebsocSchool | WebsocDepartment | AACourse)[]>([]);
    const [larcResp, setLarcResp] = useState<LarcAPIResponse>();

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

        const larcQueryParams = {
            department: formData.deptValue.toUpperCase(),
            courseNumber: formData.courseNumber,
            term: '2024 Fall',
        };

        try {
            // Query websoc for course information, populate gradescache, and query larc conditionally
            const [websocJsonResp, _] = await Promise.all([
                websocQueryParams.units.includes(',')
                    ? WebSOC.queryMultiple(websocQueryParams, 'units')
                    : WebSOC.query(websocQueryParams),
                Grades.populateGradesCache(gradesQueryParams).catch((error) => {
                    console.error(error);
                    openSnackbar('error', 'Error loading grades information');
                }),
            ]);

            if (larcQueryParams.department && larcQueryParams.term && larcQueryParams.courseNumber) {
                const larcJsonResp = await Larc.query(larcQueryParams);
                console.log(larcJsonResp);
                setLarcResp(larcJsonResp);
            }

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
            <RecruitmentBanner />
            <Box>
                <Box sx={{ height: '50px', marginBottom: '5px' }} />
                {courseData.map((_: WebsocSchool | WebsocDepartment | AACourse, index: number) => {
                    let heightEstimate = 200;
                    if ((courseData[index] as AACourse).sections !== undefined)
                        heightEstimate = (courseData[index] as AACourse).sections.length * 60 + 20 + 40;
                    return (
                        <LazyLoad once key={index} overflow height={heightEstimate} offset={500}>
                            {SectionTableWrapped({ index, courseData, scheduleNames, larcData: larcResp })}
                        </LazyLoad>
                    );
                })}
            </Box>
        </>
    );
}
