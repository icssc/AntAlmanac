/**
 * functions that manage the schedule store when loading/saving data
 */

import { RepeatingCustomEvent } from '$types/event';
import { CourseInfo, getCourseInfo, queryWebsoc } from '$lib/helpers';
import { useScheduleStore, ScheduleCourse } from '.';

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
  const { addUndoState, revertState } = useScheduleStore.getState();
  const schedules = [];
  const scheduleIndex = saveState.scheduleIndex;

  addUndoState();

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
      const courses: ScheduleCourse[] = [];
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
    revertState();
    throw new Error('Unable to load schedule');
  }
}
