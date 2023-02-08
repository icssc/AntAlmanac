import {
  AppStoreCourse,
  CourseData,
  CourseEvent,
  RepeatingCustomEvent,
  ShortCourseInfo,
  UserData,
  ZotCustomEvent,
} from '../types';
import { WEBSOC_ENDPOINT, PETERPORTAL_WEBSOC_ENDPOINT } from '$lib/endpoints';
import { Meeting, Section, WebsocResponse } from '$lib/peterportal.types';

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

/**
 * @param addedCourses courses that have been added to the schedule
 * @param scheduleNames names of the schedules
 * @returns schedule names mapped to the section codes and course term
 */
export function getSectionCodes(addedCourses: AppStoreCourse[], scheduleNames: string[]) {
  const addedSectionCodes = {};

  for (let i = 0; i < scheduleNames.length; i++) {
    addedSectionCodes[i] = new Set();
  }

  for (const course of addedCourses) {
    for (const scheduleIndex of course.scheduleIndices) {
      addedSectionCodes[scheduleIndex].add(`${course.section.sectionCode} ${course.term}`);
    }
  }
  return addedSectionCodes;
}

/**
 * @param addedCourses courses that have been added to the schedule
 * @returns an array of course events that can be added to the calendar
 */
export function calendarizeCourseEvents(addedCourses: AppStoreCourse[]) {
  const courseEventsInCalendar: CourseEvent[] = [];

  for (const course of addedCourses) {
    for (const meeting of course.section.meetings) {
      const timeString = meeting.time.replace(/\s/g, '');

      if (timeString !== 'TBA') {
        const [, startHrStr, startMinStr, endHrStr, endMinStr, ampm] = timeString.match(
          /(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/
        ) as RegExpMatchArray;

        let startHr = parseInt(startHrStr, 10);
        const startMin = parseInt(startMinStr, 10);
        let endHr = parseInt(endHrStr, 10);
        const endMin = parseInt(endMinStr, 10);

        const dates = [
          meeting.days.includes('Su'),
          meeting.days.includes('M'),
          meeting.days.includes('Tu'),
          meeting.days.includes('W'),
          meeting.days.includes('Th'),
          meeting.days.includes('F'),
          meeting.days.includes('Sa'),
        ];

        if (ampm === 'p' && endHr !== 12) {
          startHr += 12;
          endHr += 12;
          if (startHr > endHr) startHr -= 12;
        }

        dates.forEach((shouldBeInCal, index) => {
          if (shouldBeInCal) {
            const newEvent = {
              color: course.color,
              term: course.term,
              title: course.deptCode + ' ' + course.courseNumber,
              courseTitle: course.courseTitle,
              bldg: meeting.bldg,
              instructors: course.section.instructors,
              sectionCode: course.section.sectionCode,
              sectionType: course.section.sectionType,
              start: new Date(2018, 0, index, startHr, startMin),
              finalExam: course.section.finalExam,
              end: new Date(2018, 0, index, endHr, endMin),
              isCustomEvent: false as const,
              scheduleIndices: course.scheduleIndices,
            };

            courseEventsInCalendar.push(newEvent);
          }
        });
      }
    }
  }

  return courseEventsInCalendar;
}

/**
 * @param customEvents custom events that have been added to the schedule
 * @returns an array of calendar events
 */
export function calendarizeCustomEvents(customEvents: RepeatingCustomEvent[]) {
  const customEventsInCalendar: ZotCustomEvent[] = [];

  for (const customEvent of customEvents) {
    for (let dayIndex = 0; dayIndex < customEvent.days.length; dayIndex++) {
      if (customEvent.days[dayIndex]) {
        const startHour = parseInt(customEvent.start.slice(0, 2), 10);
        const startMin = parseInt(customEvent.start.slice(3, 5), 10);
        const endHour = parseInt(customEvent.end.slice(0, 2), 10);
        const endMin = parseInt(customEvent.end.slice(3, 5), 10);

        customEventsInCalendar.push({
          customEventID: customEvent.customEventID,
          color: customEvent.color || '',
          start: new Date(2018, 0, dayIndex, startHour, startMin),
          isCustomEvent: true,
          end: new Date(2018, 0, dayIndex, endHour, endMin),
          scheduleIndices: customEvent.scheduleIndices,
          title: customEvent.title,
        });
      }
    }
  }

  return customEventsInCalendar as ZotCustomEvent[];
}

/**
 * @param addedCourses courses that have been added to the schedule
 * @returns an array of calendar events
 */
export function calendarizeFinals(addedCourses: AppStoreCourse[]) {
  const finalsEventsInCalendar = [] as CourseEvent[];

  for (const course of addedCourses) {
    const finalExam = course.section.finalExam;
    if (finalExam.length > 5) {
      const [, date, , , startStr, startMinStr, endStr, endMinStr, ampm] = finalExam.match(
        /([A-za-z]+) ([A-Za-z]+) *(\d{1,2}) *(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(am|pm)/
      ) as RegExpMatchArray;
      // TODO: this block is almost the same as in calenarizeCourseEvents. we should refactor to remove the duplicate code.
      let startHour = parseInt(startStr, 10);
      const startMin = parseInt(startMinStr, 10);
      let endHour = parseInt(endStr, 10);
      const endMin = parseInt(endMinStr, 10);
      const weekdayInclusion: boolean[] = [
        date.includes('Sat'),
        date.includes('Sun'),
        date.includes('Mon'),
        date.includes('Tue'),
        date.includes('Wed'),
        date.includes('Thu'),
        date.includes('Fri'),
      ];
      if (ampm === 'pm' && endHour !== 12) {
        startHour += 12;
        endHour += 12;
        if (startHour > endHour) startHour -= 12;
      }

      weekdayInclusion.forEach((shouldBeInCal, index) => {
        if (shouldBeInCal)
          finalsEventsInCalendar.push({
            title: course.deptCode + ' ' + course.courseNumber,
            sectionCode: course.section.sectionCode,
            sectionType: 'Fin',
            bldg: course.section.meetings[0].bldg,
            color: course.color,
            scheduleIndices: course.scheduleIndices,
            start: new Date(2018, 0, index - 1, startHour, startMin),
            end: new Date(2018, 0, index - 1, endHour, endMin),
            finalExam: course.section.finalExam,
            instructors: course.section.instructors,
            term: course.term,
            isCustomEvent: false,
          });
      });
    }
  }
  return finalsEventsInCalendar;
}

/**
 * @param addedCourses courses that have been added to the schedule
 * @returns a new set that maps the term name to all the courses in that term
 */
export const termsInSchedule = (courses: AppStoreCourse[], term: string, scheduleIndex: number) =>
  new Set([
    term,
    ...courses.filter((course) => course.scheduleIndices.includes(scheduleIndex)).map((course) => course.term),
  ]);

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

interface CourseDetails {
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
