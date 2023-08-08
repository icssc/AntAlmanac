import {
    Schedule,
    ScheduleCourse,
    ScheduleSaveState,
    ScheduleUndoState,
    ShortCourseSchedule,
} from '@packages/antalmanac-types';
import { calendarizeCourseEvents, calendarizeCustomEvents, calendarizeFinals } from './calendarizeHelpers';
import { RepeatingCustomEvent } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import { CourseInfo, getCourseInfo, queryWebsoc, warnMultipleTerms } from '$lib/helpers';
import { getColorForNewSection, getScheduleTerm } from '$stores/scheduleHelpers';
import { getDefaultTerm } from '$lib/termData';

export class Schedules {
    private schedules: Schedule[];
    private currentScheduleIndex: number;
    private previousStates: ScheduleUndoState[];

    // We do not want schedule notes to be undone; to avoid this,
    // we keep track of every schedule note in an object where each key
    // is a unique ID and each value is the most recent schedule note.
    private scheduleNoteMap: { [key: number]: string };

    constructor() {
        const scheduleNoteId = Math.random();
        const term = getDefaultTerm().shortName;
        this.schedules = [
            { scheduleName: 'Schedule 1', courses: [], term: term, customEvents: [], scheduleNoteId: scheduleNoteId },
        ];
        this.currentScheduleIndex = 0;
        this.previousStates = [];
        this.scheduleNoteMap = { [scheduleNoteId]: '' };
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

    getCurrentScheduleTerm() {
        return this.getScheduleTerm(this.currentScheduleIndex);
    }

    getScheduleTerm(scheduleIndex: number) {
        return this.schedules[scheduleIndex].term;
    }

    /**
     * @return a list of all schedule names
     */
    getScheduleNames() {
        return this.schedules.map((schedule) => schedule.scheduleName);
    }

    getTermToScheduleMap() {
        return this.schedules.reduce((map, schedule, scheduleIndex) => {
            const schedulePairs = map.get(schedule.term);
            if (schedulePairs) {
                schedulePairs.push([scheduleIndex, schedule.scheduleName]);
            } else {
                map.set(schedule.term, [[scheduleIndex, schedule.scheduleName]]);
            }
            return map;
        }, new Map());
    }

    setCurrentScheduleTerm() {
        this.schedules[this.getCurrentScheduleIndex()].term = getDefaultTerm().shortName;
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
            term: getDefaultTerm().shortName,
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
     * Deletes current schedule and adjusts schedule index to current
     */
    deleteCurrentSchedule() {
        this.addUndoState();
        this.schedules.splice(this.currentScheduleIndex, 1);
        this.currentScheduleIndex = Math.min(this.currentScheduleIndex, this.getNumberOfSchedules() - 1);
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
     * @return Reference of the course that matches the params
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
     * Adds a course to a given schedule index
     * Sets color to an unused color in set, also will not add class if already exists
     * @param newCourse The course to add
     * @param scheduleIndex Defaults to current schedule
     * @param addUndoState Defaults to true
     * @returns The course object that was added.
     */
    addCourse(newCourse: ScheduleCourse, scheduleIndex: number, addUndoState = true) {
        if (this.schedules[scheduleIndex].courses.length === 0) {
            // Change term of schedule if it is empty
            this.schedules[scheduleIndex].term = newCourse.term;
        } else if (this.getScheduleTerm(scheduleIndex) !== newCourse.term) {
            warnMultipleTerms(this.getScheduleTerm(scheduleIndex), newCourse.term);
            throw new Error('Cannot add course from different term');
        }

        if (addUndoState) {
            this.addUndoState();
        }

        const existingSection = this.getExistingCourse(newCourse.section.sectionCode, newCourse.term);
        if (existingSection) {
            this.schedules[scheduleIndex].courses.push(existingSection);
            return existingSection;
        }

        const sectionToAdd = {
            ...newCourse,
            section: {
                ...newCourse.section,
                color: getColorForNewSection(newCourse, this.getCurrentCourses()),
            },
        };

        this.schedules[scheduleIndex].courses.push(sectionToAdd);
        this.setCurrentScheduleTerm();

        return sectionToAdd;
    }

    /**
     * Adds a course to every schedule
     * @returns the course object that was added
     */
    addCourseToAllSchedules(newCourse: ScheduleCourse) {
        this.addUndoState();
        for (let i = 0; i < this.getNumberOfSchedules(); i++) {
            if (this.getScheduleTerm(i) === newCourse.term) {
                this.addCourse(newCourse, i, false);
            }
        }
        this.setCurrentScheduleTerm();
        return newCourse;
    }

    /**
     * Changes courses that match the code and term in all schedules to new color
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
     */
    deleteCourse(sectionCode: string, term: string) {
        this.addUndoState();
        this.schedules[this.currentScheduleIndex].courses = this.getCurrentCourses().filter((course) => {
            return !(course.section.sectionCode === sectionCode && course.term === term);
        });
        this.setCurrentScheduleTerm();
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
            for (const [term, courseSet] of Object.entries(courseDict)) {
                const sectionCodes = Array.from(courseSet);
                // Code from ImportStudyList
                const courseInfo = getCourseInfo(
                    await queryWebsoc({
                        term: term,
                        sectionCodes: sectionCodes.join(','),
                    })
                );
                courseInfoDict.set(term, courseInfo);
            }

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
                    term: getScheduleTerm(shortCourseSchedule),
                    courses: courses,
                    customEvents: shortCourseSchedule.customEvents,
                    scheduleNoteId: scheduleNoteId,
                });
            }
        } catch (e) {
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

    appendSchedule(other: Schedules) {
        this.addUndoState();
        this.schedules.push(...other.schedules);
        this.previousStates.push(...other.previousStates);
        this.scheduleNoteMap = { ...this.scheduleNoteMap, ...other.scheduleNoteMap };
    }
}
