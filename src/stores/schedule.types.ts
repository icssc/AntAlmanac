import { RepeatingCustomEvent } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import { AASection } from '$lib/peterportal.types';

export interface ScheduleCourse {
    // Course as stored in schedule
    courseComment: string;
    courseNumber: string; //i.e. 122a
    courseTitle: string;
    deptCode: string;
    prerequisiteLink: string;
    section: AASection;
    // sectionCode: string
    term: string;
}

export interface Schedule {
    // User's schedule
    scheduleName: string;
    courses: ScheduleCourse[];
    customEvents: RepeatingCustomEvent[];
    scheduleNote: string;
}

interface ShortCourse {
    // Shortened course for saving in DB
    color: string;
    term: string;
    sectionCode: string;
}

export interface ShortCourseSchedule {
    // Schedule of short courses that is saved to DB
    scheduleName: string;
    courses: ShortCourse[];
    customEvents: RepeatingCustomEvent[];
    scheduleNote: string;
}

export interface ScheduleSaveState {
    schedules: ShortCourseSchedule[];
    scheduleIndex: number;
}

export interface ScheduleUndoState {
    schedules: Schedule[];
    scheduleIndex: number;
}
