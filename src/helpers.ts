import React from 'react';
import { addCourse, openSnackbar } from './actions/AppStoreActions';
import { PETERPORTAL_GRAPHQL_ENDPOINT, PETERPORTAL_WEBSOC_ENDPOINT, WEBSOC_ENDPOINT } from './api/endpoints';
import { AACourse, Section, WebsocResponse } from './peterportal.types';
import AppStore, { AppStoreCourse, UserData } from './stores/AppStore';

interface GradesGraphQLResponse {
    data: {
        courseGrades: {
            aggregate: {
                average_gpa: number
                sum_grade_a_count: number
                sum_grade_b_count: number
                sum_grade_c_count: number
                sum_grade_d_count: number
                sum_grade_f_count: number
                sum_grade_np_count: number
                sum_grade_p_count: number
            }
        }
    }
}

export async function queryGraphQL(queryString: string): Promise<GradesGraphQLResponse> {
    let query = JSON.stringify({
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
    return res.json()
}

export async function getCoursesData(userData: UserData) {
    const dataToSend: {[key: string]: string[][]} = {};
    const addedCourses = [];

    if (userData.addedCourses.length == 0) {
        return 
    }
    const sectionCodeToInfoMapping = userData.addedCourses.reduce((accumulator, addedCourse) => {
        accumulator[addedCourse.section.sectionCode] = { ...addedCourse };
        return accumulator;
    }, {} as {[key: string]: AppStoreCourse});

    for (let i = 0; i < userData.addedCourses.length; ++i) {
        const addedCourse = userData.addedCourses[i];
        const sectionsOfTermArray = dataToSend[addedCourse.term];

        if (sectionsOfTermArray !== undefined) {
            const lastSectionArray = sectionsOfTermArray[sectionsOfTermArray.length - 1];
            if (lastSectionArray.length === 10) sectionsOfTermArray.push([addedCourse.section.sectionCode]);
            else lastSectionArray.push(addedCourse.section.sectionCode);
        } else {
            dataToSend[addedCourse.term] = [[addedCourse.section.sectionCode]];
        }
    }
    //TODO: Cancelled classes?

    for (const [term, sectionsOfTermArray] of Object.entries(dataToSend)) {
        for (const sectionArray of sectionsOfTermArray) {
            const params = {
                term: term,
                sectionCodes: sectionArray.join(','),
            };

            const jsonResp = await queryWebsoc(params);

            for (const [sectionCode, courseData] of Object.entries(getCourseInfo(jsonResp))) {
                addedCourses.push({
                    ...sectionCodeToInfoMapping[sectionCode],
                    ...courseData.courseDetails,
                    section: courseData.section,
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
    deptCode: string
    courseNumber: string
    courseTitle: string
    courseComment: string
    prerequisiteLink: string
}

interface CourseInfo {
    courseDetails: CourseDetails
    section: Section
}

export function getCourseInfo(SOCObject: WebsocResponse) {
    let courseInfo: {[sectionCode: string]: CourseInfo} = {};
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

const websocCache: {[key: string]: any} = {};

export function clearCache() {
    Object.keys(websocCache).forEach((key) => delete websocCache[key]); //https://stackoverflow.com/a/19316873/14587004
}

export async function queryWebsoc(params: Record<string,string>): Promise<WebsocResponse> {
    // Construct a request to PeterPortal with the params as a query string
    const url = new URL(PETERPORTAL_WEBSOC_ENDPOINT);
    const searchString = new URLSearchParams(params).toString();
    if (websocCache[searchString]?.timestamp > Date.now() - 30 * 60 * 1000) {
        //if cache hit and less than 30 minutes old
        return websocCache[searchString];
    }
    url.search = searchString;
    try {
        const response = await fetch(url).then((r) => r.json());
        websocCache[searchString] = response;
        return response;
    } catch {
        const backupResponse = await fetch(WEBSOC_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        }).then((res) => res.json());
        websocCache[searchString] = backupResponse;
        return backupResponse;
    } finally {
        websocCache[searchString].timestamp = Date.now();
    }
}

const gradesCache: {[key: string]: any} = {};// TODO replace this any

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
            let schoolIndex = combined.schools.findIndex((s) => s.schoolName === school.schoolName);
            if (schoolIndex !== -1) {
                for (const dept of school.departments) {
                    let deptIndex = combined.schools[schoolIndex].departments.findIndex(
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

export async function queryWebsocMultiple(params: {[key: string]: string}, fieldName: string) {
    let responses: WebsocResponse[] = [];
    for (const field of params[fieldName].trim().replace(' ', '').split(',')) {
        let req = JSON.parse(JSON.stringify(params));
        req[fieldName] = field;
        responses.push(await queryWebsoc(req));
    }

    return combineSOCObjects(responses);
}

export const addCoursesMultiple = (courseInfo: {[sectionCode: string]: CourseInfo}, term: string, scheduleIndex: number) => {
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

export function clickToCopy(event: React.MouseEvent<HTMLDivElement,MouseEvent>, sectionCode: string) {
    event.stopPropagation();

    let tempEventTarget = document.createElement('input');
    document.body.appendChild(tempEventTarget);
    tempEventTarget.setAttribute('value', sectionCode);
    tempEventTarget.select();
    document.execCommand('copy');
    document.body.removeChild(tempEventTarget);
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
