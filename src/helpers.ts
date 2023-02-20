import React from 'react';

import { addCourse, openSnackbar } from './actions/AppStoreActions';
import {
    PETERPORTAL_GRAPHQL_ENDPOINT,
    PETERPORTAL_WEBSOC_ENDPOINT,
    WEBSOC_ENDPOINT,
    ZOTCOURSE_ENDPOINT,
} from './api/endpoints';
import { RepeatingCustomEvent } from './components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import { Meeting, Section, WebsocResponse } from './peterportal.types';
import AppStore, { AppStoreCourse, ShortCourseInfo, UserData } from './stores/AppStore';

interface GradesGraphQLResponse {
    data: {
        courseGrades: {
            aggregate: {
                average_gpa: number;
                sum_grade_a_count: number;
                sum_grade_b_count: number;
                sum_grade_c_count: number;
                sum_grade_d_count: number;
                sum_grade_f_count: number;
                sum_grade_np_count: number;
                sum_grade_p_count: number;
            };
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

export interface CourseData {
    addedCourses: AppStoreCourse[];
    scheduleNames: string[];
    customEvents: RepeatingCustomEvent[];
}

export async function getCoursesData(userData: UserData): Promise<CourseData> {
    if (userData.addedCourses.length == 0)
        return {
            addedCourses: [],
            scheduleNames: userData.scheduleNames,
            customEvents: userData.customEvents,
        };

    const sectionCodeToInfoMapping = userData.addedCourses.reduce((accumulator, addedCourse) => {
        accumulator[`${addedCourse.sectionCode}${addedCourse.term}`] = { ...addedCourse };
        return accumulator;
    }, {} as { [key: string]: ShortCourseInfo });

    const dataToSend: { [key: string]: string[][] } = {};
    for (let i = 0; i < userData.addedCourses.length; ++i) {
        const addedCourse = userData.addedCourses[i];
        const sectionsOfTermArray = dataToSend[addedCourse.term];

        if (sectionsOfTermArray !== undefined) {
            const lastSectionArray = sectionsOfTermArray[sectionsOfTermArray.length - 1];
            if (lastSectionArray.length === 10) sectionsOfTermArray.push([addedCourse.sectionCode]);
            else lastSectionArray.push(addedCourse.sectionCode);
        } else {
            dataToSend[addedCourse.term] = [[addedCourse.sectionCode]];
        }
    }
    //TODO: Cancelled classes?

    const addedCourses: AppStoreCourse[] = [];
    for (const [term, sectionsOfTermArray] of Object.entries(dataToSend)) {
        for (const sectionArray of sectionsOfTermArray) {
            const params = {
                term: term,
                sectionCodes: sectionArray.join(','),
            };

            const jsonResp = await queryWebsoc(params);

            for (const [sectionCode, courseData] of Object.entries(getCourseInfo(jsonResp))) {
                const sectionCodeInfo = sectionCodeToInfoMapping[`${sectionCode}${term}`];
                addedCourses.push({
                    ...sectionCodeInfo,
                    ...courseData.courseDetails,
                    section: {
                        ...courseData.section,
                        color: sectionCodeInfo.color,
                    },
                });
            }
        }
    }
    return {
        addedCourses: addedCourses,
        scheduleNames: userData.scheduleNames,
        customEvents: userData.customEvents,
    };
}

export interface CourseDetails {
    deptCode: string;
    courseNumber: string;
    courseTitle: string;
    courseComment: string;
    prerequisiteLink: string;
}

interface CourseInfo {
    courseDetails: CourseDetails;
    section: Section;
}

export function getCourseInfo(SOCObject: WebsocResponse) {
    const courseInfo: { [sectionCode: string]: CourseInfo } = {};
    for (const school of SOCObject.schools) {
        for (const department of school.departments) {
            for (const course of department.courses) {
                for (const section of course.sections) {
                    console.log(course.courseComment);
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

// eslint-disable-next-line @typescript-eslint/ban-types
export function processZotCourseCourseInfo(ZotCourseObjects: [Object]) {
    const courseInfo: { [sectionCode: string]: CourseInfo } = [];
    for (const obj of ZotCourseObjects) {
        for (const course of obj) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            courseInfo[course.code] = {
                courseDetails: {
                    deptCode: course.dept,
                    courseNumber: course.num,
                    courseTitle: course.title,
                    courseComment: '',
                    prerequisiteLink: '',
                },
                section: {
                    // sectionCode: course.code,
                    // sectionType: course.c_type,
                    // sectionNum: '',
                    // units: course.unit,
                    // instructors: course.instr,
                    // meetings: Meeting[],
                    // finalExam: string,
                    // maxCapacity: string,
                    // numCurrentlyEnrolled: EnrollmentCount,
                    // numOnWaitlist: string,
                    // numRequested: string,
                    // numNewOnlyReserved: string,
                    // restrictions: string,
                    // status: string,
                    // sectionComment: string
                },
            };
        }
    }
    return courseInfo;
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function queryZotCourse(schedule_name: string) {
    // TODO: Try fetch successfully. Now it doesn't work.
    // const url = new URL(ZOTCOURSE_ENDPOINT + schedule_name);
    // const response = (await fetch(url).then((r) => r.json())) as string;
    // console.log(response);

    const fake_response =
        '{"data":[{"color":"#94A2BE","course":{"c_type":"Lec","code":"34060","dept":"CompSci","final":{"date":null,"day":null,"end":null,"f_time":"TBA","month":null,"start":null},"instr":["LI, C."],"mtng":[{"bldg":"EH","days":[2,4],"end":"10:50","f_time":"TuTh  9:30-10:50 ","rm":"1200","rm_l":"https://classrooms.uci.edu/classroomtechnology/classrooms/eh/eh-1200","start":"9:30"}],"num":"122B","title":"PROJ DATA&WEB APPS","unit":"4"},"eventType":3},{"color":"#8C66D9","course":{"c_type":"Lec","code":"34190","dept":"CompSci","final":{"date":null,"day":null,"end":null,"f_time":"TBA","month":null,"start":null},"instr":["HARRIS, I."],"mtng":[{"bldg":"EH","days":[1,3,5],"end":"9:50","f_time":"MWF  9:00- 9:50 ","rm":"1200","rm_l":"https://classrooms.uci.edu/classroomtechnology/classrooms/eh/eh-1200","start":"9:00"}],"num":"145","title":"EMBEDDED SOFTWARE","unit":"6"},"eventType":3},{"color":"#4CB052","course":{"c_type":"Lec","code":"36030","dept":"In4matx","final":{"date":null,"day":null,"end":null,"f_time":"TBA","month":null,"start":null},"instr":["NAVARRO, E."],"mtng":[{"bldg":"ALP","days":[2,4],"end":"9:20","f_time":"TuTh  8:00- 9:20 ","rm":"2300","rm_l":"https://classrooms.uci.edu/classroomtechnology/classrooms/alp/alp-2300","start":"8:00"}],"num":"113","title":"REQT ANALYSIS & ENG","unit":"4"},"eventType":3},{"color":"#BFBF4D","course":{"c_type":"Dis","code":"36073","dept":"In4matx","final":null,"instr":["STAFF","VAN DER HOEK, A."],"mtng":[{"bldg":"DBH","days":[5],"end":"11:50","f_time":"F 11:00-11:50 ","rm":"1300","rm_l":"https://classrooms.uci.edu/classroomtechnology/classrooms/dbh/dbh-1300","start":"11:00"}],"num":"121","title":"SOFTWARE DESIGN I","unit":"0"},"eventType":3},{"color":"#BFBF4D","course":{"c_type":"Lab","code":"34193","dept":"CompSci","final":null,"instr":["STAFF","HARRIS, I."],"mtng":[{"bldg":"ICS2","days":[1,3,5],"end":"13:50","f_time":"MWF  1:00- 1:50p","rm":"162","rm_l":null,"start":"13:00"}],"num":"145","title":"EMBEDDED SOFTWARE","unit":"0"},"eventType":3},{"color":"#59BFB3","course":{"c_type":"Dis","code":"36033","dept":"In4matx","final":null,"instr":["STAFF","NAVARRO, E."],"mtng":[{"bldg":"SE","days":[1],"end":"11:50","f_time":"M 11:00-11:50 ","rm":"101","rm_l":"https://classrooms.uci.edu/classroomtechnology/classrooms/se/se-101","start":"11:00"}],"num":"113","title":"REQT ANALYSIS & ENG","unit":"0"},"eventType":3},{"color":"#E0C240","course":{"c_type":"Lec","code":"36070","dept":"In4matx","final":{"date":null,"day":null,"end":null,"f_time":"TBA","month":null,"start":null},"instr":["VAN DER HOEK, A."],"mtng":[{"bldg":"SSLH","days":[1,3,5],"end":"10:50","f_time":"MWF 10:00-10:50 ","rm":"100","rm_l":"https://classrooms.uci.edu/classroomtechnology/classrooms/sslh/sslh-100","start":"10:00"}],"num":"121","title":"SOFTWARE DESIGN I","unit":"4"},"eventType":3},{"color":"#A88383","dow":[2,4],"end":"17:00","eventType":1,"start":"14:00","title":"OIT"},{"color":"#8C66D9","dow":[1,3],"end":"16:00","eventType":1,"start":"14:00","title":"OIT"}],"success":true}';
    return fake_response;
}

interface CacheEntry extends WebsocResponse {
    timestamp: number;
}

const websocCache: { [key: string]: CacheEntry } = {};

export function clearCache() {
    Object.keys(websocCache).forEach((key) => delete websocCache[key]); //https://stackoverflow.com/a/19316873/14587004
}

export async function queryWebsoc(params: Record<string, string>): Promise<WebsocResponse> {
    // Construct a request to PeterPortal with the params as a query string
    const url = new URL(PETERPORTAL_WEBSOC_ENDPOINT);
    const searchString = new URLSearchParams(params).toString();
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

    try {
        const response = (await fetch(url).then((r) => r.json())) as WebsocResponse;
        websocCache[searchString] = { ...response, timestamp: Date.now() };
        return removeDuplicateMeetings(response);
    } catch {
        const backupResponse = (await fetch(WEBSOC_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        }).then((res) => res.json())) as WebsocResponse;
        websocCache[searchString] = { ...backupResponse, timestamp: Date.now() };
        return removeDuplicateMeetings(backupResponse);
    }
}

// Removes duplicate meetings as a result of multiple locations from WebsocResponse.
// See queryWebsoc for more info
// NOTE: The separator is currently an ampersand. Maybe it should be refactored to be an array
// TODO: Remove if and when API is fixed
// Maybe put this into CourseRenderPane.tsx -> flattenSOCObject()
function removeDuplicateMeetings(websocResp: WebsocResponse): WebsocResponse {
    websocResp.schools.forEach((school, schoolIndex) => {
        school.departments.forEach((department, departmentIndex) => {
            department.courses.forEach((course, courseIndex) => {
                course.sections.forEach((section, sectionIndex) => {
                    // Merge meetings that have the same meeting day and time

                    const existingMeetings: Meeting[] = [];

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
                                    bldg: existingMeetings[i].bldg + ' & ' + meeting.bldg,
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
    average_gpa: number;
    sum_grade_a_count: number;
    sum_grade_b_count: number;
    sum_grade_c_count: number;
    sum_grade_d_count: number;
    sum_grade_f_count: number;
    sum_grade_np_count: number;
    sum_grade_p_count: number;
}

const gradesCache: { [key: string]: Grades } = {};

export async function queryGrades(deptCode: string, courseNumber: string) {
    if (gradesCache[deptCode + courseNumber]) {
        return gradesCache[deptCode + courseNumber];
    }

    const queryString = `
      { courseGrades: grades(department: "${deptCode}", number: "${courseNumber}", ) {
          aggregate {
            sum_grade_a_count
            sum_grade_b_count
            sum_grade_c_count
            sum_grade_d_count
            sum_grade_f_count
            sum_grade_p_count
            sum_grade_np_count
            average_gpa
          }
      },
    }`;

    const resp = await queryGraphQL(queryString);
    const grades = resp.data.courseGrades.aggregate;

    gradesCache[deptCode + courseNumber] = grades;

    return grades;
}

export function combineSOCObjects(SOCObjects: WebsocResponse[]) {
    const combined = SOCObjects.shift() as WebsocResponse;
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
    const responses: WebsocResponse[] = [];
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
    let sectionsAdded = 0;
    for (const section of Object.values(courseInfo)) {
        addCourse(section.section, section.courseDetails, term, scheduleIndex, undefined, true);
        ++sectionsAdded;
    }
    const terms = termsInSchedule(AppStore.getAddedCourses(), term, scheduleIndex);
    if (terms.size > 1) warnMultipleTerms(terms);
    return sectionsAdded;
};

export const termsInSchedule = (courses: AppStoreCourse[], term: string, scheduleIndex: number) =>
    new Set([
        term,
        ...courses.filter((course) => course.scheduleIndices.includes(scheduleIndex)).map((course) => course.term),
    ]);

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
    openSnackbar('success', 'Section code copied to clipboard');
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
