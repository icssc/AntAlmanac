import { useSnackbar } from 'notistack';
import {
  PETERPORTAL_WEBSOC_ENDPOINT,
  WEBSOC_ENDPOINT,
  LOAD_DATA_ENDPOINT,
  LOAD_LEGACY_DATA_ENDPOINT,
} from '$lib/endpoints';
import type { Meeting, Section, WebsocResponse } from '$types/peterportal';
import { analyticsEnum, logAnalytics } from '$lib/analytics';
import { useScheduleStore } from '.';
import type { Course, RepeatingCustomEvent, Schedule } from '.';

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

interface LegacyShortCourseInfo {
  color: string;
  term: string;
  sectionCode: string;
  scheduleIndices: number[];
}

interface LegacyRepeatingCustomEvent {
  title: string;
  start: string;
  end: string;
  days: boolean[];
  customEventID: number;
  color?: string;
  scheduleIndices: number[];
}

interface LegacyUserData {
  addedCourses: LegacyShortCourseInfo[];
  scheduleNames: string[];
  customEvents: LegacyRepeatingCustomEvent[];
}

const confirmationMessage = `Are you sure you want to load a different schedule? You have unsaved changes!`;

export function useLoadSchedule() {
  const { enqueueSnackbar } = useSnackbar();

  return async (userID: string, rememberMe?: boolean) => {
    const unsavedChanges = false;

    logAnalytics({
      category: analyticsEnum.nav.title,
      action: analyticsEnum.nav.actions.LOAD_SCHEDULE,
      label: userID,
      value: rememberMe ? 1 : 0,
    });
    if (userID != null && (!unsavedChanges || window.confirm(confirmationMessage))) {
      userID = userID.replace(/\s+/g, '');
      if (userID.length > 0) {
        if (rememberMe) {
          window.localStorage.setItem('userID', userID);
        } else {
          window.localStorage.removeItem('userID');
        }

        try {
          let scheduleSaveState;
          let response_data = await fetch(LOAD_DATA_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID: userID }),
          });

          if (response_data.ok) {
            const json = (await response_data.json()) as { userData: ScheduleSaveState };
            scheduleSaveState = json.userData;

            if (!scheduleSaveState) {
              return;
            }
            if (await fromScheduleSaveState(scheduleSaveState)) {
              enqueueSnackbar(`Schedule for user ${userID} loaded!`, { variant: 'success' });
              return;
            }
            if (await fromScheduleSaveState(convertLegacySchedule(scheduleSaveState as any))) {
              enqueueSnackbar(`Schedule for user ${userID} loaded!`, { variant: 'success' });
              return;
            }
          }

          // Finally try getting and loading from legacy if none of the above works
          response_data = await fetch(LOAD_LEGACY_DATA_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID: userID }),
          });
          if (response_data.ok) {
            const json = (await response_data.json()) as { userData: LegacyUserData };
            const legacyUserData = json.userData;
            if (!legacyUserData) {
              return;
            }
            if (await fromScheduleSaveState(convertLegacySchedule(legacyUserData))) {
              enqueueSnackbar(`Legacy schedule for user ${userID} loaded!`, { variant: 'success' });
              return;
            }
          }

          // If none of the above works
          enqueueSnackbar(`Couldn't find schedules for username "${userID}".`, { variant: 'error' });
        } catch (e) {
          enqueueSnackbar('Encountered network error while loading schedules.', { variant: 'error' });
        }
      }
    }
  };
}

/**
 * Overwrites the current schedule with the input save state.
 * @param saveState
 */
async function fromScheduleSaveState(saveState: ScheduleSaveState) {
  const { schedules } = useScheduleStore.getState();

  // addUndoState();

  try {
    schedules.length = 0;
    const scheduleIndex = saveState.scheduleIndex;

    // Get a dictionary of all unique courses
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

    // Get the course info for each course
    const courseInfoDict = new Map<string, { [sectionCode: string]: CourseInfo }>();
    for (const [term, courseSet] of Object.entries(courseDict)) {
      const params = {
        term: term,
        sectionCodes: Array.from(courseSet).join(','),
      };
      const jsonResp = await queryWebsoc(params);
      courseInfoDict.set(term, getCourseInfo(jsonResp));
    }

    // Map course info to courses and transform shortened schedule to normal schedule
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

      useScheduleStore.setState({ schedules, scheduleIndex });
      return true;
    }
  } catch (e) {
    console.log(e);
    // revertState();
    return false;
  }
}

function convertLegacySchedule(legacyUserData: LegacyUserData) {
  const scheduleSaveState: ScheduleSaveState = { schedules: [], scheduleIndex: 0 };
  for (const scheduleName of legacyUserData.scheduleNames) {
    scheduleSaveState.schedules.push({ scheduleName: scheduleName, courses: [], customEvents: [] });
  }
  for (const course of legacyUserData.addedCourses) {
    for (const scheduleIndex of course.scheduleIndices) {
      scheduleSaveState.schedules[scheduleIndex].courses.push({ ...course });
    }
  }
  for (const customEvent of legacyUserData.customEvents) {
    for (const scheduleIndex of customEvent.scheduleIndices) {
      scheduleSaveState.schedules[scheduleIndex].customEvents.push({ ...customEvent });
    }
  }
  return scheduleSaveState;
}

/*
 * Convert schedule to shortened schedule (no course info) for saving.
 */
export function convertSchedulesToSave(schedule: Schedule[]) {
  const shortSchedules: ShortCourseSchedule[] = schedule.map((schedule) => {
    return {
      scheduleName: schedule.scheduleName,
      customEvents: schedule.customEvents,
      courses: schedule.courses.map((course) => {
        return {
          color: course.section.color,
          term: course.term,
          sectionCode: course.section.sectionCode,
        };
      }),
    };
  });
  return { schedules: shortSchedules, scheduleIndex: 0 };
}
