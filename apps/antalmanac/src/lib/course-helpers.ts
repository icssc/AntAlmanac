import type { WebsocAPIResponse, WebsocSectionMeeting } from 'peterportal-api-next-types';
import { PETERPORTAL_WEBSOC_ENDPOINT } from './api/endpoints';
import type { CourseInfo } from './helpers';

interface CacheEntry extends WebsocAPIResponse {
    timestamp: number;
}

const websocCache: { [key: string]: CacheEntry } = {};

export function clearCache() {
    Object.keys(websocCache).forEach((key) => delete websocCache[key]); //https://stackoverflow.com/a/19316873/14587004
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
                                meeting.days === existingMeetings[i].days &&
                                meeting.startTime === existingMeetings[i].startTime &&
                                meeting.endTime === existingMeetings[i].endTime;
                            const sameBuilding = meeting.bldg === existingMeetings[i].bldg;

                            //This shouldn't be possible because there shouldn't be duplicate locations in a section
                            if (sameDayAndTime && sameBuilding) {
                                console.warn('Found two meetings with same days, time, and bldg', websocResp);
                                break;
                            }

                            // Add the building to existing meeting instead of creating a new one
                            if (sameDayAndTime && !sameBuilding) {
                                existingMeetings[i] = {
                                    timeIsTBA: existingMeetings[i].timeIsTBA,
                                    days: existingMeetings[i].days,
                                    startTime: existingMeetings[i].startTime,
                                    endTime: existingMeetings[i].endTime,
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
    console.log(websocResp);
    return websocResp;
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

    if ('division' in record) {
        if (record['division'] === '') {
            delete record['division'];
        }
    }

    return record;
}
