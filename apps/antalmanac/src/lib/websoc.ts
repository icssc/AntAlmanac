import type { WebsocAPIResponse, WebsocSectionMeeting } from 'peterportal-api-next-types';
import { PETERPORTAL_WEBSOC_ENDPOINT } from './api/endpoints';
import type { CourseInfo } from './course_data.types';

interface CacheEntry extends WebsocAPIResponse {
    timestamp: number;
}

class _WebSOC {
    private cache: { [key: string]: CacheEntry };

    constructor() {
        this.cache = {};
    }

    clearCache() {
        Object.keys(this.cache).forEach((key) => delete this.cache[key]); //https://stackoverflow.com/a/19316873/14587004
    }

    // Construct a request to PeterPortal with the params as a query string
    async query(params: Record<string, string>) {
        // Construct a request to PeterPortal with the params as a query string
        const url = new URL(PETERPORTAL_WEBSOC_ENDPOINT);
        const searchString = new URLSearchParams(this.cleanSearchParams(params)).toString();
        if (this.cache[searchString]?.timestamp > Date.now() - 30 * 60 * 1000) {
            //NOTE: Check out how caching works
            //if cache hit and less than 30 minutes old
            return this.cache[searchString];
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
        this.cache[searchString] = { ...response, timestamp: Date.now() };
        return this.removeDuplicateMeetings(response);
    }

    async queryMultiple(params: { [key: string]: string }, fieldName: string) {
        const responses: WebsocAPIResponse[] = [];
        for (const field of params[fieldName].trim().replace(' ', '').split(',')) {
            const req = JSON.parse(JSON.stringify(params)) as Record<string, string>;
            req[fieldName] = field;
            responses.push(await this.query(req));
        }

        return this.combineSOCObjects(responses);
    }

    async getCourseInfo(websoc_params: Record<string, string>) {
        const SOCObject = await this.query(websoc_params);

        console.log(SOCObject);
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

    private combineSOCObjects(SOCObjects: WebsocAPIResponse[]) {
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

    // Removes duplicate meetings as a result of multiple locations from WebsocAPIResponse.
    // See queryWebsoc for more info
    // NOTE: The separator is currently an ampersand. Maybe it should be refactored to be an array
    // TODO: Remove if and when API is fixed
    // Maybe put this into CourseRenderPane.tsx -> flattenSOCObject()
    private removeDuplicateMeetings(websocResp: WebsocAPIResponse): WebsocAPIResponse {
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
        return websocResp;
    }

    private cleanSearchParams(record: Record<string, string>) {
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
}

export const WebSOC = new _WebSOC();

export default WebSOC;
