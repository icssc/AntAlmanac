import { RepeatingCustomEvent } from '../components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import { AASection } from '$types/peterportal';

/**
 * Course as stored in schedule
 */
export interface ScheduleCourse {
  courseComment: string;
  courseNumber: string; // e.g. 122a
  courseTitle: string;
  deptCode: string;
  prerequisiteLink: string;
  section: AASection;
  term: string;
}

/**
 * User's schedule
 */
export interface Schedule {
  scheduleName: string;
  courses: ScheduleCourse[];
  customEvents: RepeatingCustomEvent[];
}

/**
 * Shortened course for saving in DB
 */
interface ShortCourse {
  color: string;
  term: string;
  sectionCode: string;
}

/**
 * Schedule of short courses that is saved to DB
 */
export interface ShortCourseSchedule {
  scheduleName: string;
  courses: ShortCourse[];
  customEvents: RepeatingCustomEvent[];
}

/**
 * schedule save state
 */
export interface ScheduleSaveState {
  schedules: ShortCourseSchedule[];
  scheduleIndex: number;
}

/**
 * schedule undo state
 */
export interface ScheduleUndoState {
  schedules: Schedule[];
  scheduleIndex: number;
}
