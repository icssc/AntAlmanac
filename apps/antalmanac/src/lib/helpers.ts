import React from 'react';

import { WebsocSection, WebsocAPIResponse } from 'peterportal-api-next-types';
import { TermNames } from '@packages/antalmanac-types';
import { PETERPORTAL_GRAPHQL_ENDPOINT } from './api/endpoints';
import { queryWebsoc } from './course-helpers';
import { addCourse, openSnackbar } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';
import { RepeatingCustomEvent } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import trpc from '$lib/api/trpc';

interface GradesGraphQLResponse {
    data: {
        aggregateGrades: {
            gradeDistribution: Grades;
        };
    };
}

export async function queryGraphQL(queryString: string): Promise<GradesGraphQLResponse> {
    const query = JSON.stringify({
        query: queryString,
    });

    const res = await fetch(`${PETERPORTAL_GRAPHQL_ENDPOINT}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: query,
    });
    return res.json() as Promise<GradesGraphQLResponse>;
}
export interface CourseDetails {
    deptCode: string;
    courseNumber: string;
    courseTitle: string;
    courseComment: string;
    prerequisiteLink: string;
}

export interface CourseInfo {
    courseDetails: CourseDetails;
    section: WebsocSection;
}

export interface ZotCourseResponse {
    codes: string[];
    customEvents: RepeatingCustomEvent[];
}
export async function queryZotCourse(schedule_name: string) {
    const response = await trpc.zotcourse.getUserData.mutate({ scheduleName: schedule_name });
    // For custom event, there is no course attribute in each.
    const codes = response.data
        .filter((section: { eventType: number }) => section.eventType === 3)
        .map((section: { course: { code: string } }) => section.course.code) as string[];
    const days = [false, false, false, false, false, false, false];
    const customEvents: RepeatingCustomEvent[] = response.data
        .filter((section: { eventType: number }) => section.eventType === 1)
        .map((event: { title: string; start: string; end: string; dow: number[] }) => {
            return {
                title: event.title,
                start: event.start,
                end: event.end,
                days: days.map((_, index) => event.dow.includes(index)),
                scheduleIndices: [AppStore.getCurrentScheduleIndex()],
                customEventID: Date.now(),
                color: '#551a8b',
            };
        }) as RepeatingCustomEvent[];
    return {
        codes: codes,
        customEvents: customEvents,
    };
}

export interface Grades {
    averageGPA: number;
    gradeACount: number;
    gradeBCount: number;
    gradeCCount: number;
    gradeDCount: number;
    gradeFCount: number;
    gradePCount: number;
    gradeNPCount: number;
}

const gradesCache: { [key: string]: Grades } = {};

export async function queryGrades(deptCode: string, courseNumber: string) {
    if (gradesCache[deptCode + courseNumber]) {
        return gradesCache[deptCode + courseNumber];
    }

    const queryString = `
      { aggregateGrades(department: "${deptCode}", courseNumber: "${courseNumber}", ) {
        gradeDistribution {
        gradeACount
        gradeBCount
        gradeCCount
        gradeDCount
        gradeFCount
        gradePCount
        gradeNPCount
        averageGPA
        }
      },
    }`;

    const resp = await queryGraphQL(queryString);
    const grades = resp.data.aggregateGrades.gradeDistribution;

    gradesCache[deptCode + courseNumber] = grades;

    return grades;
}

export function combineSOCObjects(SOCObjects: WebsocAPIResponse[]) {
    const combined = SOCObjects.shift() as WebsocAPIResponse;
    for (const res of SOCObjects) {
        for (const school of res.schools) {
            const schoolIndex = combined.schools.findIndex((s) => s.schoolName === school.schoolName);
            if (schoolIndex !== -1) {
                for (const dept of school.departments) {
                    const deptIndex = combined.schools[schoolIndex].departments.findIndex(
                        (d) => d.deptCode === dept.deptCode
                    );
                    if (deptIndex !== -1) {
                        const courses = new Set(combined.schools[schoolIndex].departments[deptIndex].courses);
                        for (const course of dept.courses) {
                            courses.add(course);
                        }
                        const coursesArray = Array.from(courses);
                        coursesArray.sort(
                            (left, right) =>
                                parseInt(left.courseNumber.replace(/\D/g, '')) -
                                parseInt(right.courseNumber.replace(/\D/g, ''))
                        );
                        combined.schools[schoolIndex].departments[deptIndex].courses = coursesArray;
                    } else {
                        combined.schools[schoolIndex].departments.push(dept);
                    }
                }
            } else {
                combined.schools.push(school);
            }
        }
    }
    return combined;
}

export async function queryWebsocMultiple(params: { [key: string]: string }, fieldName: string) {
    const responses: WebsocAPIResponse[] = [];
    for (const field of params[fieldName].trim().replace(' ', '').split(',')) {
        const req = JSON.parse(JSON.stringify(params)) as Record<string, string>;
        req[fieldName] = field;
        responses.push(await queryWebsoc(req));
    }

    return combineSOCObjects(responses);
}

export const addCoursesMultiple = (
    courseInfo: { [sectionCode: string]: CourseInfo },
    term: TermNames,
    scheduleIndex: number
) => {
    for (const section of Object.values(courseInfo)) {
        addCourse(section.section, section.courseDetails, term, scheduleIndex);
    }
    // const terms = termsInSchedule(term);
    // if (terms.size > 1) warnMultipleTerms(terms);
    return Object.values(courseInfo).length;
};

export const termsInSchedule = (term: string) =>
    new Set([term, ...AppStore.schedule.getCurrentCourses().map((course) => course.term)]);

export const warnMultipleTerms = (scheduleTerm: string, addedTerm: string) => {
    openSnackbar(
        'warning',
        `Course from ${addedTerm} was not added.\nSchedule can contain courses from ${scheduleTerm} only.`,
        undefined,
        undefined,
        { whiteSpace: 'pre-line' }
    );
};

export async function clickToCopy(event: React.MouseEvent<HTMLElement, MouseEvent>, sectionCode: string) {
    event.stopPropagation();
    await navigator.clipboard.writeText(sectionCode);
    openSnackbar('success', 'WebsocSection code copied to clipboard');
}

export function isDarkMode() {
    switch (AppStore.getTheme()) {
        case 'light':
            return false;
        case 'dark':
            return true;
        default:
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
}

/**
 * @param courseNumber A string that represents the course number of a course (eg. '122A', '121')
 * @returns This function returns an int or number with a decimal representation of the passed in string (eg. courseNumAsDecimal('122A') returns 122.1, courseNumAsDecimal('121') returns 121)
 */
export function courseNumAsDecimal(courseNumber: string): number {
    // I wanted to split the course detail number into letters and digits
    const courseNumArr = courseNumber.split(/(\d+)/);
    // Gets rid of empty strings in courseNumArr
    const filtered = courseNumArr.filter((value) => value !== '');

    // Return 0 if array is empty
    if (filtered.length === 0) {
        console.error(`No characters were found, returning 0, Input: ${courseNumber}`);
        return 0;
    }

    const lastElement = filtered[filtered.length - 1].toUpperCase(); // .toUpperCase() won't affect numeric characters
    const lastElementCharCode = lastElement.charCodeAt(0); // Just checks the first character of the last element in the array
    // Return the last element of the filtered array as an integer if it represents an integer
    if ('0'.charCodeAt(0) <= lastElementCharCode && lastElementCharCode <= '9'.charCodeAt(0)) {
        return parseInt(lastElement);
    }

    // If the string does not have any numeric characters
    if (filtered.length === 1) {
        console.error(`The string did not have numbers, returning 0, Input: ${courseNumber}`);
        return 0;
    }

    // This element is the second to last element of the array, supposedly a string of numeric characters
    const secondToLastElement = filtered[filtered.length - 2];
    // The characters within [A-I] or [a-i] will be converted to 1-9, respectively
    const letterAsNumber = lastElement.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    if (1 <= letterAsNumber && letterAsNumber <= 9) {
        return parseFloat(`${secondToLastElement}.${letterAsNumber}`);
    } else {
        console.error(
            `The first character type at the end of the string was not within [A-I] or [a-i], returning last numbers found in string, Violating Character: ${
                filtered[filtered.length - 1][0]
            }, Input: ${courseNumber}`
        );
        // This will represent an integer at this point because the split in the beginning split the array into strings of digits and strings of other characters
        // If the last element in the array does not represent an integer, then the second to last element must represent an integer
        return parseInt(secondToLastElement);
    }
}

export const FAKE_LOCATIONS = ['VRTL REMOTE', 'ON LINE', 'TBA'];
