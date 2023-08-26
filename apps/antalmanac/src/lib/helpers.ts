import React from 'react';

import { WebsocSectionMeeting, WebsocSection, WebsocAPIResponse } from 'peterportal-api-next-types';
import { PETERPORTAL_GRAPHQL_ENDPOINT, PETERPORTAL_WEBSOC_ENDPOINT } from './api/endpoints';
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

export async function queryGraphQL(queryString: string): Promise<GradesGraphQLResponse | null> {
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

    const json = await res.json();

    if (!res.ok || json.data === null) return null;

    return json as Promise<GradesGraphQLResponse>;
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

export function getCourseInfo(SOCObject: WebsocAPIResponse) {
    const courseInfo: { [sectionCode: string]: CourseInfo } = {};
    for (const school of SOCObject.schools) {
        for (const department of school.departments) {
            for (const course of department.courses) {
                for (const section of course.sections) {
                    courseInfo[section.sectionCode] = {
                        courseDetails: {
                            deptCode: department.deptCode,
                            courseNumber: course.courseNumber,
                            courseTitle: course.courseTitle,
                            courseComment: course.courseComment,
                            prerequisiteLink: course.prerequisiteLink,
                        },
                        section: section,
                    };
                }
            }
        }
    }
    return courseInfo;
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

interface CacheEntry extends WebsocAPIResponse {
    timestamp: number;
}

const websocCache: { [key: string]: CacheEntry } = {};

export function clearCache() {
    Object.keys(websocCache).forEach((key) => delete websocCache[key]); //https://stackoverflow.com/a/19316873/14587004
    Object.keys(gradesCache).forEach((key) => delete gradesCache[key]); //https://stackoverflow.com/a/19316873/14587004
}

function cleanParams(record: Record<string, string>) {
    if ('term' in record) {
        const termValue = record['term'];
        const termParts = termValue.split(' ');

        if (termParts.length === 2) {
            const [year, quarter] = termParts;

            delete record['term'];

            record['quarter'] = quarter;
            record['year'] = year;
        }
    }

    if ('startTime' in record) {
        if (record['startTime'] === '') {
            delete record['startTime'];
        }
    }

    if ('endTime' in record) {
        if (record['endTime'] === '') {
            delete record['endTime'];
        }
    }

    return record;
}

// Construct a request to PeterPortal with the params as a query string
export async function queryWebsoc(params: Record<string, string>) {
    // Construct a request to PeterPortal with the params as a query string
    const url = new URL(PETERPORTAL_WEBSOC_ENDPOINT);
    const searchString = new URLSearchParams(cleanParams(params)).toString();
    if (websocCache[searchString]?.timestamp > Date.now() - 30 * 60 * 1000) {
        //NOTE: Check out how caching works
        //if cache hit and less than 30 minutes old
        return websocCache[searchString];
    }
    url.search = searchString;

    //The data from the API will duplicate a section if it has multiple locations.
    //I.e., if there's a Tuesday section in two different (probably adjoined) rooms,
    //courses[i].sections[j].meetings will have two entries, despite it being the same section.
    //For now, I'm correcting it with removeDuplicateMeetings, but the API should handle this

    const response: WebsocAPIResponse = await fetch(url, {
        headers: {
            Referer: 'https://antalmanac.com/',
        },
    })
        .then((r) => r.json())
        .then((r) => r.payload);
    websocCache[searchString] = { ...response, timestamp: Date.now() };
    return removeDuplicateMeetings(response);
}

// Removes duplicate meetings as a result of multiple locations from WebsocAPIResponse.
// See queryWebsoc for more info
// NOTE: The separator is currently an ampersand. Maybe it should be refactored to be an array
// TODO: Remove if and when API is fixed
// Maybe put this into CourseRenderPane.tsx -> flattenSOCObject()
function removeDuplicateMeetings(websocResp: WebsocAPIResponse): WebsocAPIResponse {
    websocResp.schools.forEach((school, schoolIndex) => {
        school.departments.forEach((department, departmentIndex) => {
            department.courses.forEach((course, courseIndex) => {
                course.sections.forEach((section, sectionIndex) => {
                    // Merge meetings that have the same meeting day and time

                    const existingMeetings: WebsocSectionMeeting[] = [];

                    // I know that this is n^2, but a section can't have *that* many locations
                    for (const meeting of section.meetings) {
                        let isNewMeeting = true;

                        for (let i = 0; i < existingMeetings.length; i++) {
                            const sameDayAndTime =
                                meeting.days === existingMeetings[i].days && meeting.time === existingMeetings[i].time;
                            const sameBuilding = meeting.bldg === existingMeetings[i].bldg;

                            //This shouldn't be possible because there shouldn't be duplicate locations in a section
                            if (sameDayAndTime && sameBuilding) {
                                console.warn('Found two meetings with same days, time, and bldg', websocResp);
                                break;
                            }

                            // Add the building to existing meeting instead of creating a new one
                            if (sameDayAndTime && !sameBuilding) {
                                existingMeetings[i] = {
                                    days: existingMeetings[i].days,
                                    time: existingMeetings[i].time,
                                    bldg: [existingMeetings[i].bldg + ' & ' + meeting.bldg],
                                };
                                isNewMeeting = false;
                            }
                        }

                        if (isNewMeeting) existingMeetings.push(meeting);
                    }

                    // Update websocResp with correct meetings
                    websocResp.schools[schoolIndex].departments[departmentIndex].courses[courseIndex].sections[
                        sectionIndex
                    ].meetings = existingMeetings;
                });
            });
        });
    });
    return websocResp;
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

// null means that the request failed
// undefined means that the request is in progress
const gradesCache: { [key: string]: Grades | null | undefined } = {};

/*
 * Query the PeterPortal GraphQL API for a course's grades with caching
 *
 * @param deptCode The department code of the course.
 * @param courseNumber The course number of the course.
 * @param instructor The instructor's name (optional)
 *
 * @returns Grades
 */
export async function queryGrades(deptCode: string, courseNumber: string, instructor = ''): Promise<Grades | null> {
    instructor = instructor.replace('STAFF', '').trim(); // Ignore STAFF
    const instructorFilter = instructor ? `instructor: "${instructor}"` : '';

    const cacheKey = deptCode + courseNumber + instructor;

    // If cache is null, that request failed last time, and we try again
    if (cacheKey in gradesCache && gradesCache[cacheKey] !== null) {
        // If cache is undefined, there's a request in progress
        while (gradesCache[cacheKey] === undefined) {
            await new Promise((resolve) => setTimeout(resolve, 350)); // Wait before checking cache again
        }
        return gradesCache[cacheKey] as Grades;
    }

    gradesCache[cacheKey] = undefined; // Set cache to undefined to indicate request in progress

    const queryString = `{ 
        aggregateGrades(department: "${deptCode}", courseNumber: "${courseNumber}", ${instructorFilter}) {
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
    gradesCache[cacheKey] = resp?.data?.aggregateGrades?.gradeDistribution;

    return gradesCache[cacheKey] as Grades;
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
    term: string,
    scheduleIndex: number
) => {
    for (const section of Object.values(courseInfo)) {
        addCourse(section.section, section.courseDetails, term, scheduleIndex, true);
    }
    const terms = termsInSchedule(term);
    if (terms.size > 1) warnMultipleTerms(terms);
    return Object.values(courseInfo).length;
};

export const termsInSchedule = (term: string) =>
    new Set([term, ...AppStore.schedule.getCurrentCourses().map((course) => course.term)]);

export const warnMultipleTerms = (terms: Set<string>) => {
    openSnackbar(
        'warning',
        `Course added from different term.\nSchedule now contains courses from ${[...terms].sort().join(', ')}.`,
        undefined,
        undefined,
        { whiteSpace: 'pre-line' }
    );
};

export function clickToCopy(event: React.MouseEvent<HTMLElement, MouseEvent>, sectionCode: string) {
    event.stopPropagation();
    void navigator.clipboard.writeText(sectionCode);
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
 * @param {string} courseNumber A string that represents the course number of a course (eg. '122A', '121')
 * @returns {int | number} This function returns an int or number with a decimal representation of the passed in string (eg. courseNumAsDecimal('122A') returns 122.1, courseNumAsDecimal('121') returns 121)
 */
export function courseNumAsDecimal(courseNumber: string) {
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
