import { useSnackbar } from 'notistack';
import { PETERPORTAL_GRAPHQL_ENDPOINT, PETERPORTAL_WEBSOC_ENDPOINT, WEBSOC_ENDPOINT } from '$lib/endpoints';
import { Meeting, Section, WebsocResponse } from '$types/peterportal';

/**
 * grades returned by GraphQL endpoint
 */
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

/**
 * wrapper for the GraphQL endpoint
 * @remarks this should be a hook??
 */
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

/**
 * course details
 */
export interface CourseDetails {
  deptCode: string;
  courseNumber: string;
  courseTitle: string;
  courseComment: string;
  prerequisiteLink: string;
}

/**
 * course info
 */
export interface CourseInfo {
  courseDetails: CourseDetails;
  section: Section;
}

/**
 * get course info from a websocket response
 */
export function getCourseInfo(SOCObject: WebsocResponse) {
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

interface CacheEntry extends WebsocResponse {
  timestamp: number;
}

const websocCache: { [key: string]: CacheEntry } = {};

export function clearCache() {
  Object.keys(websocCache).forEach((key) => delete websocCache[key]); //https://stackoverflow.com/a/19316873/14587004
}

/**
 * query the websocket endpoint
 */
export async function queryWebsoc(params: Record<string, string>): Promise<WebsocResponse> {
  const url = new URL(PETERPORTAL_WEBSOC_ENDPOINT);
  const searchString = new URLSearchParams(params).toString();
  if (websocCache[searchString]?.timestamp > Date.now() - 30 * 60 * 1000) {
    // NOTE: Check out how caching works
    // if cache hit and less than 30 minutes old
    return websocCache[searchString];
  }
  url.search = searchString;

  // The data from the API will duplicate a section if it has multiple locations.
  // i.e., if there's a Tuesday section in two different (probably adjoined) rooms,
  // courses[i].sections[j].meetings will have two entries, despite it being the same section.
  // For now, I'm correcting it with removeDuplicateMeetings, but the API should handle this

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
          const deptIndex = combined.schools[schoolIndex].departments.findIndex((d) => d.deptCode === dept.deptCode);
          if (deptIndex !== -1) {
            const courses = new Set(combined.schools[schoolIndex].departments[deptIndex].courses);
            for (const course of dept.courses) {
              courses.add(course);
            }
            const coursesArray = Array.from(courses);
            coursesArray.sort(
              (left, right) =>
                parseInt(left.courseNumber.replace(/\D/g, '')) - parseInt(right.courseNumber.replace(/\D/g, ''))
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

/**
 * hook that returns a mouse event handler
 * that will copy the designated text to the clipboard and open a snackbar
 */
export function useClickToCopy() {
  const { enqueueSnackbar } = useSnackbar();

  return (event: React.MouseEvent<HTMLElement, MouseEvent>, sectionCode: string) => {
    event.stopPropagation();
    navigator.clipboard.writeText(sectionCode);
    enqueueSnackbar('Section code copied to clipboard', { variant: 'success' });
  };
}

/**
 * @param courseNumber represents the course number of a course (eg. '122A', '121')
 * @returns an int or number with a decimal representation of the passed in string
 * @example courseNumAsDecimal('122A') returns 122.1, courseNumAsDecimal('121') returns 121
 */
export function courseNumAsDecimal(courseNumber: string) {
  /**
   * split the course detail number into letters and digits
   */
  const courseNumArr = courseNumber.split(/(\d+)/);

  /**
   * get rid of empty strings in courseNumArr
   */
  const filtered = courseNumArr.filter((value) => value !== '');

  /**
   * Return 0 if array is empty
   */
  if (filtered.length === 0) {
    console.error(`No characters were found, returning 0, Input: ${courseNumber}`);
    return 0;
  }

  /**
   * won't affect numeric characters
   */
  const lastElement = filtered[filtered.length - 1].toUpperCase();

  /**
   * checks first character of the last element
   */
  const lastElementCharCode = lastElement.charCodeAt(0);

  /**
   * return last element of the filtered array if it's an integer
   */
  if ('0'.charCodeAt(0) <= lastElementCharCode && lastElementCharCode <= '9'.charCodeAt(0)) {
    return parseInt(lastElement);
  }

  /**
   * If the string does not have any numeric characters
   */
  if (filtered.length === 1) {
    console.error(`The string did not have numbers, returning 0, Input: ${courseNumber}`);
    return 0;
  }

  /**
   * string of numeric characters
   */
  const secondToLastElement = filtered[filtered.length - 2];

  /**
   * characters within [A-I] or [a-i] will be converted to 1-9, respectively
   */
  const letterAsNumber = lastElement.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0) + 1;
  if (1 <= letterAsNumber && letterAsNumber <= 9) {
    return parseFloat(`${secondToLastElement}.${letterAsNumber}`);
  } else {
    console.error(
      `The first character type at the end of the string was not within [A-I] or [a-i], returning last numbers found in string, Violating Character: ${
        filtered[filtered.length - 1][0]
      }, Input: ${courseNumber}`
    );

    /**
     * should be an integer because string was initially split into strings of digits
     * if last element in the array is not integer, then second to last should be
     */
    return parseInt(secondToLastElement);
  }
}
