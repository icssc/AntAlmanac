/**
 * functions that manage the schedule store when loading/saving data
 */

import { PETERPORTAL_WEBSOC_ENDPOINT, WEBSOC_ENDPOINT } from '$lib/endpoints';
import type { Meeting, Section, WebsocResponse } from '$types/peterportal';
import { useScheduleStore } from '.';
import type { Course, RepeatingCustomEvent } from '.';

/**
 * shortened course for saving in DB
 */
interface ShortCourse {
  color: string;
  term: string;
  sectionCode: string;
}

/**
 * schedule of short courses that is saved to DB
 */
interface ShortCourseSchedule {
  scheduleName: string;
  courses: ShortCourse[];
  customEvents: RepeatingCustomEvent[];
}

/**
 * schedule save state
 */
interface ScheduleSaveState {
  schedules: ShortCourseSchedule[];
  scheduleIndex: number;
}

/**
 * Convert schedule to shortened schedule (no course info) for saving.
 */
export function getScheduleAsSaveState() {
  const { schedules, scheduleIndex } = useScheduleStore.getState();

  const shortSchedules = schedules.map((schedule) => ({
    scheduleName: schedule.scheduleName,
    customEvents: schedule.customEvents,
    courses: schedule.courses.map((course) => ({
      color: course.section.color,
      term: course.term,
      sectionCode: course.section.sectionCode,
    })),
  }));

  return { schedules: shortSchedules, scheduleIndex };
}

/**
 * Overwrites the current schedule with the input save state.
 * @param saveState the save state to load
 */
export async function fromScheduleSaveState(saveState: ScheduleSaveState) {
  const { schedules } = useScheduleStore.getState();

  schedules.length = 0;
  const scheduleIndex = saveState.scheduleIndex;

  // addUndoState();

  try {
    /**
     * reset the schedule and update the schedule index
     */
    useScheduleStore.setState({ schedules, scheduleIndex });

    /**
     * Get a dictionary of all unique courses
     */
    const courseDict: { [key: string]: Set<string> } = {};
    for (const schedule of saveState.schedules) {
      for (const course of schedule.courses) {
        if (course.term in courseDict) {
          courseDict[course.term].add(course.sectionCode);
        } else {
          courseDict[course.term] = new Set([course.sectionCode]);
        }
      }
    }

    /**
     * Get the course info for each course
     */
    const courseInfoDict = new Map<string, { [sectionCode: string]: CourseInfo }>();
    for (const [term, courseSet] of Object.entries(courseDict)) {
      const params = {
        term: term,
        sectionCodes: Array.from(courseSet).join(','),
      };
      const jsonResp = await queryWebsoc(params);
      courseInfoDict.set(term, getCourseInfo(jsonResp));
    }

    /**
     * Map course info to courses and transform shortened schedule to normal schedule
     */
    for (const shortCourseSchedule of saveState.schedules) {
      const courses: Course[] = [];
      for (const shortCourse of shortCourseSchedule.courses) {
        const courseInfoMap = courseInfoDict.get(shortCourse.term);
        if (courseInfoMap !== undefined) {
          const courseInfo = courseInfoMap[shortCourse.sectionCode];
          courses.push({
            ...shortCourse,
            ...courseInfo.courseDetails,
            section: {
              ...courseInfo.section,
              color: shortCourse.color,
            },
          });
        }
      }
      schedules.push({
        ...shortCourseSchedule,
        courses,
      });
    }
    useScheduleStore.setState({ schedules });
  } catch (e) {
    // revertState();
    throw new Error('Unable to load schedule');
  }
}

/**
 * course details
 */
interface CourseDetails {
  deptCode: string;
  courseNumber: string;
  courseTitle: string;
  courseComment: string;
  prerequisiteLink: string;
}

/**
 * course info
 */
interface CourseInfo {
  courseDetails: CourseDetails;
  section: Section;
}

/**
 * get course info from a websocket response
 */
function getCourseInfo(SOCObject: WebsocResponse) {
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

/**
 * query the websocket endpoint
 */
async function queryWebsoc(params: Record<string, string>): Promise<WebsocResponse> {
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
