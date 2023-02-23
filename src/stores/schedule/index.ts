/**
 * basic schedule store with primitive accessors
 *
 * all other files in this folder are de-coupled from one another,
 * and only extend this store's functionality
 *
 * move common/shared interfaces here
 */

import { create } from 'zustand';

import type { AASection, Section } from '$lib/peterportal.types';

export interface RepeatingCustomEvent {
    title: string;
    start: string;
    end: string;
    days: boolean[];
    customEventID: number;
    color?: string;
}

export interface CourseDetails {
    courseComment: string;
    courseNumber: string;
    courseTitle: string;
    deptCode: string;
    prerequisiteLink: string;
}

export interface CourseInfo {
    courseDetails: CourseDetails;
    section: Section;
}

export interface Course extends CourseDetails {
    section: AASection;
    term: string;
}

export interface Schedule {
    scheduleName: string;
    courses: Course[];
    customEvents: RepeatingCustomEvent[];
}

export interface ShortCourse {
    color: string;
    term: string;
    sectionCode: string;
}

export interface ShortCourseSchedule {
    scheduleName: string;
    courses: ShortCourse[];
    customEvents: RepeatingCustomEvent[];
}

/**
 * saved schedule in the database (similar to the undo state, but with less data)
 */
export interface ScheduleSaveState {
    schedules: ShortCourseSchedule[];
    scheduleIndex: number;
}

/**
 * saved schedule in memory
 */
export interface ScheduleUndoState {
    schedules: Schedule[];
    scheduleIndex: number;
}

export interface ScheduleStore {
    /**
     * all schedules
     */
    schedules: Schedule[];

    /**
     * index of currently selected schedule
     */
    scheduleIndex: number;

    /**
     * undo tree
     */
    previousStates: ScheduleUndoState[];

    /**
     * redo tree
     */
    nextStates: ScheduleUndoState[];

    /**
     * whether the schedule's been saved
     */
    saved: boolean;
}

/**
 * hook to access the store (shared state) with info about the current schedules
 */
export const useScheduleStore = create<ScheduleStore>(() => ({
    schedules: [{ scheduleName: 'Schedule 1', courses: [], customEvents: [] }],
    scheduleIndex: 0,
    previousStates: [],
    nextStates: [],
    saved: true,
}));
