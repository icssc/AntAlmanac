import {
    Schedule,
    ScheduleCourse,
    ScheduleSaveState,
    ScheduleUndoState,
    ShortCourseSchedule,
    RepeatingCustomEvent,
} from '@packages/antalmanac-types';

import { calendarizeCourseEvents, calendarizeCustomEvents, calendarizeFinals } from './calendarizeHelpers';

import type { CourseInfo } from '$lib/course_data.types';
import WebSOC from '$lib/websoc';
import { getColorForNewSection } from '$stores/scheduleHelpers';

export class Schedules {
    private schedules: Schedule[];
    private currentScheduleIndex: number;
    private previousStates: ScheduleUndoState[];
    private skeletonSchedules: ShortCourseSchedule[];

    // We do not want schedule notes to be undone; to avoid this,
    // we keep track of every schedule note in an object where each key
    // is a unique ID and each value is the most recent schedule note.
    private scheduleNoteMap: { [key: number]: string };

    constructor() {
        const scheduleNoteId = Math.random();
        this.schedules = [
            { scheduleName: 'Schedule 1', courses: [], customEvents: [], scheduleNoteId: scheduleNoteId },
        ];
        this.currentScheduleIndex = 0;
        this.previousStates = [];
        this.scheduleNoteMap = { [scheduleNoteId]: '' };
        this.skeletonSchedules = [];
    }

    // --- Schedule index methods ---
    getCurrentScheduleIndex() {
        return this.currentScheduleIndex;
    }

    // --- Schedule related methods ---
    getNumberOfSchedules() {
        return this.schedules.length;
    }

    getCurrentScheduleName() {
        return this.schedules[this.currentScheduleIndex].scheduleName;
    }

    /**
     * @return a specific schedule name
     */
    getScheduleName(scheduleIndex: number) {
        return this.schedules[scheduleIndex]?.scheduleName;
    }

    /**
     * @return a list of all schedule names
     */
    getScheduleNames() {
        return this.schedules.map((schedule) => schedule.scheduleName);
    }

    /**
     * Changes schedule to one at new index
     */
    setCurrentScheduleIndex(newScheduleIndex: number) {
        this.addUndoState();
        this.currentScheduleIndex = newScheduleIndex;
    }

    /**
     * Creates an empty schedule
     */
    addNewSchedule(newScheduleName: string) {
        this.addUndoState();
        const scheduleNoteId = Math.random();
        this.schedules.push({
            scheduleName: newScheduleName,
            courses: [],
            customEvents: [],
            scheduleNoteId: scheduleNoteId,
        });
        // Setting schedule index manually otherwise 2 undo states are added
        this.currentScheduleIndex = this.getNumberOfSchedules() - 1;
        this.scheduleNoteMap[scheduleNoteId] = '';
    }

    /**
     * Renames schedule at index
     */
    renameSchedule(newScheduleName: string, scheduleIndex: number) {
        this.addUndoState();
        this.schedules[scheduleIndex].scheduleName = newScheduleName;
    }

    /**
     * Deletes all courses and custom events from current schedule
     */
    clearCurrentSchedule() {
        this.addUndoState();
        this.getCurrentCourses().length = 0;
        this.getCurrentCustomEvents().length = 0;
    }

    /**
     * Deletes specific schedule and adjusts schedule index to current
     */
    deleteSchedule(scheduleIndex: number) {
        this.addUndoState();
        this.schedules.splice(scheduleIndex, 1);
        this.currentScheduleIndex = Math.min(scheduleIndex, this.getNumberOfSchedules() - 1);
    }

    /**
     * Adds all courses from current schedule to another (doesn't wipe schedules that are being copied into)
     * More like append than copy
     * @param to If equal to number of schedules will copy to all schedules
     */
    copySchedule(to: number) {
        this.addUndoState();
        for (const course of this.getCurrentCourses()) {
            if (to === this.getNumberOfSchedules()) {
                this.addCourseToAllSchedules(course);
            } else {
                this.addCourse(course, to, false);
            }
        }

        for (const customEvent of this.getCurrentCustomEvents()) {
            if (to === this.getNumberOfSchedules()) {
                this.addCustomEvent(customEvent, [...Array(to).keys()]);
            } else {
                this.addCustomEvent(customEvent, [to]);
            }
        }
    }

    // --- Course related methods ---
    getCurrentCourses() {
        return this.schedules[this.currentScheduleIndex]?.courses || [];
    }

    /**
     * @return Set of "{sectionCode} {term} in current schedule"
     */
    getAddedSectionCodes() {
        return new Set(this.getCurrentCourses().map((course) => `${course.section.sectionCode} ${course.term}`));
    }

    /**
     * @return Combined list of courses from all schedules with duplicates
     */
    getAllCourses() {
        return this.schedules.map((schedule) => schedule.courses).flat(1);
    }

    /**
     * @return A course that matches the params across all schedules
     */
    getExistingCourse(sectionCode: string, term: string) {
        for (const course of this.getAllCourses()) {
            if (course.section.sectionCode === sectionCode && term === course.term) {
                return course;
            }
        }
        return undefined;
    }

    /**
     * @return A course that matches the params in the current schedule
     */
    getExistingCourseInSchedule(sectionCode: string, term: string) {
        for (const course of this.getCurrentCourses()) {
            if (course.section.sectionCode === sectionCode && term === course.term) {
                return course;
            }
        }
        return undefined;
    }

    /**
     * Adds a course to a given schedule index
     * Sets color to an unused color in set, also will not add class if already exists
     * @param newCourse The course to add
     * @param scheduleIndex Defaults to current schedule
     * @param addUndoState Defaults to true
     * @returns The course object that was added.
     */
    addCourse(newCourse: ScheduleCourse, scheduleIndex: number, addUndoState = true) {
        if (addUndoState) {
            this.addUndoState();
        }

        const existingSection = this.getExistingCourseInSchedule(newCourse.section.sectionCode, newCourse.term);

        const existsInSchedule = this.doesCourseExistInSchedule(
            newCourse.section.sectionCode,
            newCourse.term,
            scheduleIndex
        );

        if (existsInSchedule && existingSection) {
            return existingSection; // If it's already present in a schedule, then no need to push it
        }

        if (existingSection) {
            this.schedules[scheduleIndex].courses.push(existingSection); // existingSection is pushed so methods (e.g. @changeCourseColor) have the appropriate (i.e. same) course reference across all schedules
            return existingSection;
        }

        const sectionToAdd = {
            ...newCourse,
            section: {
                ...newCourse.section,
                color: getColorForNewSection(
                    newCourse,
                    this.getAllCourses().filter((course) => course.term === newCourse.term)
                ), // New colors are drawn from a Set of unused colors across the newCourse's term
            },
        };

        this.schedules[scheduleIndex].courses.push(sectionToAdd);

        return sectionToAdd;
    }

    /**
     * Adds a course to every schedule
     * @returns the course object that was added
     */
    addCourseToAllSchedules(newCourse: ScheduleCourse) {
        this.addUndoState();
        for (let i = 0; i < this.getNumberOfSchedules(); i++) {
            this.addCourse(newCourse, i, false);
        }
        return newCourse;
    }

    /**
     * Changes courses that match the code and term in all schedules to new color
     */
    changeCourseColor(sectionCode: string, term: string, newColor: string) {
        this.addUndoState();

        const course = this.getExistingCourseInSchedule(sectionCode, term);
        if (course) {
            course.section.color = newColor;
        }
    }

    /**
     * Deletes a course in current schedule
     */
    deleteCourse(sectionCode: string, term: string) {
        this.addUndoState();
        this.schedules[this.currentScheduleIndex].courses = this.getCurrentCourses().filter((course) => {
            return !(course.section.sectionCode === sectionCode && course.term === term);
        });
    }

    /**
     * Checks if a course has already been added to a schedule
     */
    doesCourseExistInSchedule(sectionCode: string, term: string, scheduleIndex: number) {
        for (const course of this.schedules[scheduleIndex].courses) {
            if (course.section.sectionCode === sectionCode && term === course.term) {
                return true;
            }
        }
        return false;
    }

    // --- Custom Event related methods ---
    getCurrentCustomEvents() {
        return this.schedules[this.currentScheduleIndex]?.customEvents || [];
    }

    /**
     * @return Reference of the custom event that matches the ID
     */
    getExistingCustomEvent(customEventId: number) {
        for (const customEvent of this.getAllCustomEvents()) {
            if (customEvent.customEventID === customEventId) {
                return customEvent;
            }
        }
        return undefined;
    }

    /**
     * @return Schedule indices of schedules that contain the custom event
     * @param customEventId
     */
    getIndexesOfCustomEvent(customEventId: number) {
        const indices: number[] = [];
        for (const scheduleIndex of this.schedules.keys()) {
            if (this.doesCustomEventExistInSchedule(customEventId, scheduleIndex)) {
                indices.push(scheduleIndex);
            }
        }
        return indices;
    }

    /**
     * @return List of all custom events in all schedules(with duplicates)
     */
    getAllCustomEvents() {
        return this.schedules.map((schedule) => schedule.customEvents).flat(1);
    }

    /**
     * Adds a new custom event to given indices
     */
    addCustomEvent(newCustomEvent: RepeatingCustomEvent, scheduleIndices: number[]) {
        this.addUndoState();
        for (const scheduleIndex of scheduleIndices) {
            if (!this.doesCustomEventExistInSchedule(newCustomEvent.customEventID, scheduleIndex)) {
                this.schedules[scheduleIndex].customEvents.push(newCustomEvent);
            }
        }
    }

    /**
     * Deletes custom event from the given indices.
     * @param scheduleIndices Defaults to current schedule.
     */
    deleteCustomEvent(customEventId: number, scheduleIndices: number[] = [this.getCurrentScheduleIndex()]) {
        this.addUndoState();
        for (const scheduleIndex of scheduleIndices) {
            const customEvents = this.schedules[scheduleIndex].customEvents;
            const index = customEvents.findIndex((customEvent) => customEvent.customEventID === customEventId);
            if (index !== undefined) {
                customEvents.splice(index, 1);
            }
        }
    }

    /**
     * Change color of a custom event
     */
    changeCustomEventColor(customEventId: number, newColor: string) {
        this.addUndoState();
        const customEvent = this.getExistingCustomEvent(customEventId);
        if (customEvent) {
            customEvent.color = newColor;
        }
    }

    /**
     * Replaces properties of custom event with ones from editedCustomEvent and moves the custom event to newIndices.
     * Edits the custom event object itself so all references are edited.
     */
    editCustomEvent(editedCustomEvent: RepeatingCustomEvent, newIndices: number[]) {
        this.addUndoState();
        const customEvent = this.getExistingCustomEvent(editedCustomEvent.customEventID);
        if (customEvent === undefined) {
            this.addCustomEvent(editedCustomEvent, newIndices);
            return;
        }

        // Modify the original custom event so all references are updated as well
        Object.assign(customEvent, editedCustomEvent);

        const currentIndices = this.getIndexesOfCustomEvent(editedCustomEvent.customEventID);
        // Equivalent to currentIndices set minus newIndices
        const indicesToDelete = currentIndices.filter((index) => !newIndices.includes(index));
        this.deleteCustomEvent(customEvent.customEventID, indicesToDelete);

        // Equivalent to newIndices set minus currentIndices
        const indicesToAdd = newIndices.filter((index) => !currentIndices.includes(index));
        this.addCustomEvent(customEvent, indicesToAdd);
    }

    /**
     * Checks if a schedule contains the custom event ID
     */
    doesCustomEventExistInSchedule(customEventId: number, scheduleIndex: number) {
        for (const customEvent of this.schedules[scheduleIndex].customEvents) {
            if (customEvent.customEventID === customEventId) {
                return true;
            }
        }
        return false;
    }

    // --- Calender related methods ---
    /**
     * Convert courses and custom events into calendar friendly format
     */
    getCalendarizedEvents() {
        return [
            ...calendarizeCourseEvents(this.getCurrentCourses()),
            ...calendarizeCustomEvents(this.getCurrentCustomEvents()),
        ];
    }

    /**
     * Convert just courses into calendar compatible format.
     */
    getCalendarizedCourseEvents() {
        return calendarizeCourseEvents(this.getCurrentCourses());
    }

    /**
     * Convert just custom events into calendar compatible format.
     */
    getCalendarizedCustomEvents() {
        return calendarizeCustomEvents(this.getCurrentCustomEvents());
    }

    /**
     * Convert finals into calendar friendly format
     */
    getCalendarizedFinals() {
        return calendarizeFinals(this.getCurrentCourses());
    }

    // --- Other methods ---
    /**
     * Appends a copy of the current schedule to previous states to revert to
     * Previous states are capped to 50
     */
    addUndoState() {
        const clonedSchedules = JSON.parse(JSON.stringify(this.schedules)) as Schedule[]; // Create deep copy of Schedules object
        this.previousStates.push({
            schedules: clonedSchedules,
            scheduleIndex: this.currentScheduleIndex,
        });
        if (this.previousStates.length >= 50) {
            this.previousStates.shift();
        }
    }

    /**
     * Reverts schedule to the last undoState (undoes the last action).
     * All actions that call `addUndoState()` can be reverted.
     */
    revertState() {
        const state = this.previousStates.pop();
        if (state !== undefined) {
            this.schedules = state.schedules;
            this.currentScheduleIndex = state.scheduleIndex;
        }
    }

    /*
     * Convert schedule to shortened schedule (no course info) for saving.
     */
    getScheduleAsSaveState(): ScheduleSaveState {
        const shortSchedules: ShortCourseSchedule[] = this.schedules.map((schedule) => {
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
                scheduleNote: this.scheduleNoteMap[schedule.scheduleNoteId],
            };
        });
        return { schedules: shortSchedules, scheduleIndex: this.currentScheduleIndex };
    }

    /**
     * Overwrites the current schedule with the input save state.
     * @param saveState
     */
    async fromScheduleSaveState(saveState: ScheduleSaveState) {
        this.addUndoState();
        try {
            this.schedules.length = 0;
            this.currentScheduleIndex = saveState.scheduleIndex;

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

            const websocRequests = Object.entries(courseDict).map(async ([term, courseSet]) => {
                const sectionCodes = Array.from(courseSet).join(',');
                const courseInfo = await WebSOC.getCourseInfo({ term, sectionCodes });
                courseInfoDict.set(term, courseInfo);
            });

            await Promise.all(websocRequests);

            // Map course info to courses and transform shortened schedule to normal schedule
            for (const shortCourseSchedule of saveState.schedules) {
                const courses: ScheduleCourse[] = [];
                for (const shortCourse of shortCourseSchedule.courses) {
                    const courseInfoMap = courseInfoDict.get(shortCourse.term);
                    if (courseInfoMap !== undefined) {
                        const courseInfo = courseInfoMap[shortCourse.sectionCode];
                        if (courseInfo === undefined) {
                            // Class doesn't exist/was cancelled
                            continue;
                        }
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

                const scheduleNoteId = Math.random();
                if ('scheduleNote' in shortCourseSchedule) {
                    this.scheduleNoteMap[scheduleNoteId] = shortCourseSchedule.scheduleNote;
                } else {
                    // If this is a schedule that was saved before schedule notes were implemented,
                    // just give each schedule an empty schedule note
                    this.scheduleNoteMap[scheduleNoteId] = '';
                }

                this.schedules.push({
                    scheduleName: shortCourseSchedule.scheduleName,
                    courses: courses,
                    customEvents: shortCourseSchedule.customEvents,
                    scheduleNoteId: scheduleNoteId,
                });
            }
        } catch (e) {
            console.error(e);
            this.revertState();
            throw new Error('Unable to load schedule');
        }
    }

    getCurrentScheduleNote() {
        const scheduleNoteId = this.schedules[this.currentScheduleIndex]?.scheduleNoteId;
        if (scheduleNoteId === undefined) {
            return '';
        }
        return this.scheduleNoteMap[scheduleNoteId];
    }

    updateScheduleNote(newScheduleNote: string, scheduleIndex: number) {
        const scheduleNoteId = this.schedules[scheduleIndex].scheduleNoteId;
        this.scheduleNoteMap[scheduleNoteId] = newScheduleNote;
    }

    getSkeletonSchedule(): ShortCourseSchedule {
        return this.skeletonSchedules[this.currentScheduleIndex];
    }

    setSkeletonSchedules(skeletonSchedules: ShortCourseSchedule[]) {
        this.skeletonSchedules = skeletonSchedules;
    }
}
