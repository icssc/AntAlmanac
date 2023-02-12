import {
    amber,
    blue,
    blueGrey,
    cyan,
    deepPurple,
    green,
    indigo,
    lightGreen,
    lime,
    pink,
    purple,
    red,
    teal,
} from '@material-ui/core/colors';

import { RepeatingCustomEvent } from '../components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import { CourseInfo, getCourseInfo, queryWebsoc } from '../helpers';
import { calendarizeCourseEvents, calendarizeCustomEvents, calendarizeFinals } from './calendarizeHelpers';
import { Schedule, ScheduleCourse, ScheduleSaveState, ScheduleUndoState, ShortCourseSchedule } from './schedule.types';

const arrayOfColors = [
    red[500],
    pink[500],
    purple[500],
    indigo[500],
    deepPurple[500],
    blue[500],
    green[500],
    cyan[500],
    teal[500],
    lightGreen[500],
    lime[500],
    amber[500],
    blueGrey[500],
];

export class Schedules {
    private schedules: Schedule[];
    private currentScheduleIndex: number;
    private previousStates: ScheduleUndoState[];

    constructor() {
        this.schedules = [{ scheduleName: 'Schedule 1', courses: [], customEvents: [] }];
        this.currentScheduleIndex = 0;
        this.previousStates = [];
    }

    // --- Schedule index methods ---
    /**
     * @return current schedule index
     */
    getCurrentScheduleIndex() {
        return this.currentScheduleIndex;
    }

    // --- Schedule related methods ---
    /**
     * @return the number of schedules
     */
    getNumberOfSchedules() {
        return this.schedules.length;
    }

    /**
     * @return the current schedule's name
     */
    getCurrentScheduleName() {
        return this.schedules[this.currentScheduleIndex].scheduleName;
    }

    /**
     * @return a list of all schedule names
     */
    getScheduleNames() {
        return this.schedules.map((schedule) => schedule.scheduleName);
    }

    /**
     * Sets current schedule index
     * @param newScheduleIndex
     */
    setCurrentScheduleIndex(newScheduleIndex: number) {
        this.addUndoState();
        this.currentScheduleIndex = newScheduleIndex;
    }

    /**
     * Creates an empty schedule
     * @param newScheduleName
     */
    addNewSchedule(newScheduleName: string) {
        this.addUndoState();
        this.schedules.push({ scheduleName: newScheduleName, courses: [], customEvents: [] });
        // Setting schedule index manually otherwise 2 undo states are added
        this.currentScheduleIndex = this.getNumberOfSchedules() - 1;
    }

    /**
     * Renames current schedule
     * @param newScheduleName
     * @param scheduleIndex
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
     * Deletes current schedule and adjusts current schedule index accordingly
     */
    deleteCurrentSchedule() {
        this.addUndoState();
        this.schedules.splice(this.currentScheduleIndex, 1);
        this.currentScheduleIndex = Math.min(this.currentScheduleIndex, this.getNumberOfSchedules() - 1);
    }

    /**
     * Adds all courses from current schedule to another (doesn't wipe schedules that are being copied into)
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
    }

    // --- Course related methods ---
    /**
     * @return List of courses in current schedule
     */
    getCurrentCourses() {
        return this.schedules[this.currentScheduleIndex].courses;
    }

    /**
     * @return Set of "{sectionCode} {term} in current schedule"
     */
    getAddedSectionCodes() {
        return new Set(this.getCurrentCourses().map((course) => `${course.section.sectionCode} ${course.term}`));
    }

    /**
     * @return List of all courses with duplicates
     */
    getAllCourses() {
        return this.schedules.map((schedule) => schedule.courses).flat(1);
    }

    /**
     * @return Reference of the course that matches the params.
     * @param sectionCode
     * @param term
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
     * Adds a course to a given schedule index.
     * @param newCourse
     * @param scheduleIndex Defaults to current schedule.
     * @param addUndoState Defaults to true.
     */
    addCourse(newCourse: ScheduleCourse, scheduleIndex: number = this.getCurrentScheduleIndex(), addUndoState = true) {
        if (addUndoState) {
            this.addUndoState();
        }
        let courseToAdd = this.getExistingCourse(newCourse.section.sectionCode, newCourse.term);
        if (courseToAdd === undefined) {
            const setOfUsedColors = new Set(this.getAllCourses().map((course) => course.section.color));

            const color: string =
                arrayOfColors.find((materialColor) => !setOfUsedColors.has(materialColor)) || '#5ec8e0';
            courseToAdd = {
                ...newCourse,
                section: {
                    ...newCourse.section,
                    color,
                },
            };
        }

        if (!this.doesCourseExistInSchedule(newCourse.section.sectionCode, newCourse.term, scheduleIndex)) {
            this.schedules[scheduleIndex].courses.push(courseToAdd);
        }
    }

    /**
     * Adds a course every schedule
     * @param newCourse
     */
    addCourseToAllSchedules(newCourse: ScheduleCourse) {
        this.addUndoState();
        for (let i = 0; i < this.getNumberOfSchedules(); i++) {
            this.addCourse(newCourse, i, false);
        }
    }

    /**
     * Changes courses matching code and term in all schedules to new color
     * @param sectionCode
     * @param term
     * @param newColor
     */
    changeCourseColor(sectionCode: string, term: string, newColor: string) {
        this.addUndoState();
        const course = this.getExistingCourse(sectionCode, term);
        if (course) {
            course.section.color = newColor;
        }
    }

    /**
     * Deletes a course in current schedule
     * @param sectionCode
     * @param term
     */
    deleteCourse(sectionCode: string, term: string) {
        this.addUndoState();
        this.schedules[this.currentScheduleIndex].courses = this.getCurrentCourses().filter((course) => {
            return !(course.section.sectionCode === sectionCode && course.term === term);
        });
    }

    /**
     * Checks if a course has already been added to a schedule
     * @param sectionCode
     * @param term
     * @param scheduleIndex
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
    /**
     * @return Reference of list of custom events in current schedule
     */
    getCurrentCustomEvents() {
        return this.schedules[this.currentScheduleIndex].customEvents;
    }

    /**
     * @return Reference of the custom event that matches the ID.
     * @param customEventId
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
     * @param newCustomEvent
     * @param scheduleIndices
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
     * @param customEventId
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
     * @param customEventId
     * @param newColor
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
     * @param editedCustomEvent
     * @param newIndices
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
     * @param customEventId
     * @param scheduleIndex
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
    toCalendarizedEvents() {
        return [
            ...calendarizeCourseEvents(this.getCurrentCourses()),
            ...calendarizeCustomEvents(this.getCurrentCustomEvents()),
        ];
    }

    /**
     * Convert finals into calendar friendly format
     */
    toCalendarizedFinals() {
        return calendarizeFinals(this.getCurrentCourses());
    }

    // --- Other methods ---
    /**
     * Appends a copy of the current state to previous states to revert to.
     * Previous states are capped to 50 to prevent memory usage from going infinite.
     */
    addUndoState() {
        const clonedSchedules = JSON.parse(JSON.stringify(this.schedules)) as Schedule[]; // Create deep copy of Schedules object
        this.previousStates.push({ schedules: clonedSchedules, scheduleIndex: this.currentScheduleIndex });
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
                this.schedules.push({
                    ...shortCourseSchedule,
                    courses,
                });
            }
        } catch (e) {
            this.revertState();
            throw new Error('Unable to load schedule');
        }
    }
}
