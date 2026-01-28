import type {
    Schedule,
    ScheduleCourse,
    ScheduleSaveState,
    ScheduleUndoState,
    ShortCourseSchedule,
    RepeatingCustomEvent,
    CourseInfo,
    CustomEventId,
    CourseDetails,
} from '@packages/antalmanac-types';

import { calendarizeCourseEvents, calendarizeCustomEvents, calendarizeFinals } from './calendarizeHelpers';

import { getDefaultTerm } from '$lib/termData';
import { WebSOC } from '$lib/websoc';
import { getColorForNewSection } from '$stores/scheduleHelpers';

/**
 * Manages state of schedules. Only one instance is really needed for the app.
 */
export class Schedules {
    private schedules: Schedule[];

    private currentScheduleIndex: number;

    private previousStates: ScheduleUndoState[];

    private futureStates: ScheduleUndoState[];

    private skeletonSchedules: ShortCourseSchedule[];

    /**
     * We do not want schedule notes to be undone; to avoid this,
     * we keep track of every schedule note in an object where each key
     * is a unique ID and each value is the most recent schedule note.
     */
    private scheduleNoteMap: Record<number, string>;

    constructor() {
        const scheduleNoteId = Math.random();

        this.schedules = [
            {
                scheduleName: `${getDefaultTerm().shortName.replaceAll(' ', '-')}`,
                courses: [],
                customEvents: [],
                scheduleNoteId: scheduleNoteId,
            },
        ];
        this.currentScheduleIndex = 0;
        this.previousStates = [];
        this.futureStates = [];
        this.scheduleNoteMap = { [scheduleNoteId]: '' };
        this.skeletonSchedules = [];
    }

    getNextScheduleName(scheduleIndex: number, newScheduleName: string) {
        const scheduleNames = this.getScheduleNames();
        scheduleNames.splice(scheduleIndex, 1);
        let nextScheduleName = newScheduleName;
        let counter = 1;

        while (scheduleNames.includes(nextScheduleName)) {
            nextScheduleName = `${newScheduleName}(${counter++})`;
        }
        return nextScheduleName;
    }

    getDefaultScheduleName() {
        return getDefaultTerm().shortName.replaceAll(' ', '-');
    }

    getCurrentScheduleIndex() {
        return this.currentScheduleIndex;
    }

    getNumberOfSchedules() {
        return this.schedules.length;
    }

    getCurrentScheduleName() {
        return this.schedules[this.currentScheduleIndex].scheduleName;
    }

    /**
     * Get the name of schedule.
     */
    getScheduleName(scheduleIndex: number) {
        return this.schedules[scheduleIndex]?.scheduleName;
    }

    /**
     * Get all schedule names.
     */
    getScheduleNames() {
        return this.schedules.map((schedule) => schedule.scheduleName);
    }

    /**
     * Change current schedule to the schedule at the specified index.
     */
    setCurrentScheduleIndex(newScheduleIndex: number) {
        this.addUndoState();
        this.currentScheduleIndex = newScheduleIndex;
    }

    /**
     * Create an empty schedule.
     * @param newScheduleName The name of the new schedule. If a schedule with the same name already exists, a number will be appended to the name.
     */
    addNewSchedule(newScheduleName: string) {
        this.addUndoState();
        const scheduleNoteId = Math.random();
        this.schedules.push({
            scheduleName: this.getNextScheduleName(this.getNumberOfSchedules(), newScheduleName),
            courses: [],
            customEvents: [],
            scheduleNoteId: scheduleNoteId,
        });
        // Setting schedule index manually otherwise 2 undo states are added
        this.currentScheduleIndex = this.getNumberOfSchedules() - 1;
        this.scheduleNoteMap[scheduleNoteId] = '';
    }

    /**
     * Rename schedule with the specified index.
     * @param newScheduleName The name of the new schedule. If a schedule with the same name already exists, a number will be appended to the name.
     */
    renameSchedule(scheduleIndex: number, newScheduleName: string) {
        this.addUndoState();
        this.schedules[scheduleIndex].scheduleName = this.getNextScheduleName(scheduleIndex, newScheduleName);
    }

    /**
     * Delete all courses and custom events from current schedule.
     */
    clearCurrentSchedule() {
        this.addUndoState();
        this.getCurrentCourses().length = 0;
        this.getCurrentCustomEvents().length = 0;
    }

    /**
     * Delete specific schedule and adjusts schedule index to current.
     */
    deleteSchedule(scheduleIndex: number) {
        this.addUndoState();
        this.schedules.splice(scheduleIndex, 1);
        this.currentScheduleIndex = Math.min(scheduleIndex, this.getNumberOfSchedules() - 1);
    }

    /**
     * Copy the schedule at the provided index to a newly created schedule with the specified name.
     */
    copySchedule(scheduleIndex: number, newScheduleName: string) {
        this.addNewSchedule(newScheduleName);
        this.currentScheduleIndex = scheduleIndex; // temporarily set current schedule to the one being copied
        const to = this.getNumberOfSchedules() - 1;

        for (const course of this.getCurrentCourses()) {
            this.addCourse(course, to, false);
        }

        for (const customEvent of this.getCurrentCustomEvents()) {
            this.addCustomEvent(customEvent, [to], false);
        }
        this.currentScheduleIndex = this.previousStates[this.previousStates.length - 1].scheduleIndex; // return to previously selected schedule index
    }

    /**
     * Reorder schedules by moving a schedule from one index to another.
     * This modifies the order of schedules and updates the current schedule index to maintain the correct reference.
     */
    reorderSchedule(from: number, to: number) {
        this.addUndoState();
        const [removed] = this.schedules.splice(from, 1);
        this.schedules.splice(to, 0, removed);
        if (this.currentScheduleIndex === from) {
            this.currentScheduleIndex = to;
        } else if (this.currentScheduleIndex > from && this.currentScheduleIndex <= to) {
            this.currentScheduleIndex -= 1;
        } else if (this.currentScheduleIndex < from && this.currentScheduleIndex >= to) {
            this.currentScheduleIndex += 1;
        }
    }
    getCurrentCourses() {
        return this.schedules[this.currentScheduleIndex]?.courses || [];
    }

    /**
     * Get a set of "{sectionCode} {term}" section codes in current schedule.
     */
    getAddedSectionCodes() {
        return new Set(this.getCurrentCourses().map((course) => `${course.section.sectionCode} ${course.term}`));
    }

    /**
     * Get combined list of courses from all schedules with duplicates.
     */
    getAllCourses() {
        return this.schedules.map((schedule) => schedule.courses).flat(1);
    }

    /**
     * Get course that matches the params across **all** schedules.
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
     * Get a course that matches the params in the **current** schedule.
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
     * Adds a course to a given schedule index.
     * Sets color to an unused color in set, also will not add class if already exists
     *
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

        // If it's already present in a schedule, then no need to push it.
        if (existsInSchedule && existingSection) {
            return existingSection;
        }

        // existingSection is pushed so methods (e.g. @changeCourseColor) have the same course reference across all schedules.
        if (existingSection) {
            this.schedules[scheduleIndex].courses.push(existingSection);
            return existingSection;
        }
        const sectionToAdd = {
            ...newCourse,
            section: {
                ...newCourse.section,
                // New colors are drawn from a Set of unused colors across the newCourse's term
                color: getColorForNewSection(
                    newCourse,
                    this.getAllCourses().filter((course) => course.term === newCourse.term)
                ),
            },
        };

        this.schedules[scheduleIndex].courses.push(sectionToAdd);

        return sectionToAdd;
    }

    /**
     * Add a course to every schedule.
     * @returns the course object that was added.
     */
    addCourseToAllSchedules(newCourse: ScheduleCourse) {
        this.addUndoState();
        for (let i = 0; i < this.getNumberOfSchedules(); i++) {
            this.addCourse(newCourse, i, false);
        }
        return newCourse;
    }

    /**
     * Change courses that match the code and term in all schedules to new color.
     */
    changeCourseColor(sectionCode: string, term: string, newColor: string) {
        this.addUndoState();

        const course = this.getExistingCourseInSchedule(sectionCode, term);

        if (course) {
            course.section.color = newColor;
        }
    }

    /**
     * Delete a course in current schedule.
     */
    deleteCourse(sectionCode: string, term: string, scheduleIndex: number) {
        this.addUndoState();
        this.setCurrentScheduleIndex(scheduleIndex);
        this.schedules[scheduleIndex].courses = this.schedules[this.currentScheduleIndex].courses.filter((course) => {
            return !(course.section.sectionCode === sectionCode && course.term === term);
        });
    }

    /**
     * Check if a course has already been added to a schedule.
     */
    doesCourseExistInSchedule(sectionCode: string, term: string, scheduleIndex: number) {
        for (const course of this.schedules[scheduleIndex].courses) {
            if (course.section.sectionCode === sectionCode && term === course.term) {
                return true;
            }
        }
        return false;
    }

    getCurrentCustomEvents() {
        return this.schedules[this.currentScheduleIndex]?.customEvents || [];
    }

    /**
     * Get a reference ito the custom event that matches the ID.
     */
    getExistingCustomEvent(customEventId: CustomEventId) {
        for (const customEvent of this.getAllCustomEvents()) {
            if (customEvent.customEventID === customEventId) {
                return customEvent;
            }
        }
        return undefined;
    }

    /**
     * Get indices of schedules that contain the custom event.
     */
    getIndexesOfCustomEvent(customEventId: CustomEventId) {
        const indices: number[] = [];

        for (const scheduleIndex of this.schedules.keys()) {
            if (this.doesCustomEventExistInSchedule(customEventId, scheduleIndex)) {
                indices.push(scheduleIndex);
            }
        }
        return indices;
    }

    /**
     * Get custom events in all schedules (with duplicates).
     */
    getAllCustomEvents() {
        return this.schedules.map((schedule) => schedule.customEvents).flat(1);
    }

    /**
     * Adds a new custom event to given indices
     */
    addCustomEvent(newCustomEvent: RepeatingCustomEvent, scheduleIndices: number[], addUndoState = true) {
        if (addUndoState) {
            this.addUndoState();
        }
        for (const scheduleIndex of scheduleIndices) {
            if (!this.doesCustomEventExistInSchedule(newCustomEvent.customEventID, scheduleIndex)) {
                this.schedules[scheduleIndex].customEvents.push(newCustomEvent);
            }
        }
    }

    /**
     * Deletes custom event from the given indices.
     * @param scheduleIndices The schedule indices to delete the custom event from.
     */
    deleteCustomEvent(customEventId: CustomEventId, scheduleIndices = [this.getCurrentScheduleIndex()]) {
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
    changeCustomEventColor(customEventId: CustomEventId, newColor: string) {
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
    doesCustomEventExistInSchedule(customEventId: CustomEventId, scheduleIndex: number) {
        for (const customEvent of this.schedules.at(scheduleIndex)?.customEvents ?? []) {
            if (customEvent.customEventID === customEventId) {
                return true;
            }
        }
        return false;
    }

    /**
     * Convert courses and custom events into calendar friendly format.
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

    /**
     * Getter for previous states
     */
    getPreviousStates() {
        return this.previousStates;
    }

    /**
     * Clears previous states
     */
    clearPreviousStates() {
        this.previousStates = [];
        this.futureStates = [];
    }

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
        this.futureStates = [];
    }

    /**
     * Reverts schedule to the last undoState (undoes the last action).
     * All actions that call `addUndoState()` can be reverted.
     */
    revertState() {
        const state = this.previousStates.pop();
        if (state === undefined) {
            return false;
        }
        const clonedSchedules = JSON.parse(JSON.stringify(this.schedules)) as Schedule[];
        this.futureStates.push({
            schedules: clonedSchedules,
            scheduleIndex: this.currentScheduleIndex,
        });
        if (this.futureStates.length >= 50) {
            this.futureStates.shift();
        }
        this.schedules = state.schedules;
        this.currentScheduleIndex = state.scheduleIndex;
        return true;
    }

    advanceState() {
        const state = this.futureStates.pop();
        if (state === undefined) {
            return false;
        }
        const clonedSchedules = JSON.parse(JSON.stringify(this.schedules)) as Schedule[];
        this.previousStates.push({
            schedules: clonedSchedules,
            scheduleIndex: this.currentScheduleIndex,
        });
        if (this.previousStates.length >= 50) {
            this.previousStates.shift();
        }
        this.schedules = state.schedules;
        this.currentScheduleIndex = state.scheduleIndex;
        return true;
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
     */
    async fromScheduleSaveState(saveState: ScheduleSaveState) {
        this.addUndoState();

        try {
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

            // Fetch complete sectionTypes for each unique course
            // When getCourseInfo is called with specific sectionCodes, WebSOC only returns those sections,
            // so sectionTypes is incomplete. We need to fetch all sections of each course to get complete sectionTypes.
            const completeSectionTypesDict = new Map<string, CourseDetails['sectionTypes']>();
            const uniqueCourses = new Set<string>();

            // Extract unique (term, deptCode, courseNumber) combinations
            for (const [term, courseInfoMap] of courseInfoDict) {
                for (const [, courseInfo] of Object.entries(courseInfoMap)) {
                    const key = `${term}-${courseInfo.courseDetails.deptCode}-${courseInfo.courseDetails.courseNumber}`;
                    uniqueCourses.add(key);
                }
            }

            // Group courses by (term, deptCode) to batch queries
            const coursesByDept = new Map<string, string[]>();
            for (const courseKey of uniqueCourses) {
                const [term, deptCode] = courseKey.split('-') as [string, string, string];
                const deptKey = `${term}-${deptCode}`;
                if (!coursesByDept.has(deptKey)) {
                    coursesByDept.set(deptKey, []);
                }
                coursesByDept.get(deptKey)!.push(courseKey);
            }

            // Fetch full course data for each (term, deptCode) combination
            const fullCourseRequests = Array.from(coursesByDept.entries()).map(async ([deptKey, courseKeys]) => {
                const [term, deptCode] = deptKey.split('-') as [string, string];
                try {
                    // Query all courses in this dept at once (WebSOC returns all courses when courseNumber is omitted)
                    const fullData = await WebSOC.query({ term, deptCode });

                    // Build a map of courseNumber -> sectionTypes for this dept
                    const courseSectionTypesMap = new Map<string, CourseDetails['sectionTypes']>();

                    for (const school of fullData.schools) {
                        for (const dept of school.departments) {
                            for (const course of dept.courses) {
                                const sectionTypesSet = new Set<CourseDetails['sectionTypes'][number]>();
                                course.sections.forEach((section) => {
                                    sectionTypesSet.add(section.sectionType);
                                });
                                courseSectionTypesMap.set(course.courseNumber, Array.from(sectionTypesSet));
                            }
                        }
                    }

                    // Store results in the main dictionary
                    for (const courseKey of courseKeys) {
                        const courseNumber = courseKey.split('-')[2];
                        const sectionTypes = courseSectionTypesMap.get(courseNumber);
                        if (sectionTypes) {
                            completeSectionTypesDict.set(courseKey, sectionTypes);
                        }
                    }
                } catch (e) {
                    console.error(`Failed to fetch full course data for ${deptKey}:`, e);
                    // Fall back to incomplete sectionTypes from courseInfo
                }
            });

            await Promise.all(fullCourseRequests);

            this.schedules.length = 0;
            this.currentScheduleIndex = saveState.scheduleIndex;

            // Map course info to courses and transform shortened schedule to normal schedule
            for (const shortCourseSchedule of saveState.schedules) {
                const courses: ScheduleCourse[] = [];
                for (const shortCourse of shortCourseSchedule.courses) {
                    const courseInfoMap = courseInfoDict.get(shortCourse.term);
                    if (courseInfoMap !== undefined) {
                        const courseInfo = courseInfoMap[shortCourse.sectionCode.padStart(5, '0')];
                        if (courseInfo === undefined) {
                            // Class doesn't exist/was cancelled
                            continue;
                        }

                        // Use complete sectionTypes if available
                        const courseKey = `${shortCourse.term}-${courseInfo.courseDetails.deptCode}-${courseInfo.courseDetails.courseNumber}`;
                        const completeSectionTypes = completeSectionTypesDict.get(courseKey);

                        const courseDetails = { ...courseInfo.courseDetails };
                        if (completeSectionTypes) {
                            courseDetails.sectionTypes = completeSectionTypes;
                        }

                        courses.push({
                            ...shortCourse,
                            ...courseDetails,
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

        if (scheduleNoteId == null) {
            return '';
        }

        return this.scheduleNoteMap[scheduleNoteId];
    }

    updateScheduleNote(newScheduleNote: string, scheduleIndex: number) {
        const scheduleNoteId = this.schedules[scheduleIndex].scheduleNoteId;
        this.scheduleNoteMap[scheduleNoteId] = newScheduleNote;
    }

    getCurrentSkeletonSchedule(): ShortCourseSchedule {
        return this.skeletonSchedules[this.currentScheduleIndex];
    }

    getSkeletonScheduleNames(): string[] {
        return this.skeletonSchedules.map((schedule) => schedule.scheduleName);
    }

    setSkeletonSchedules(skeletonSchedules: ShortCourseSchedule[]) {
        this.skeletonSchedules = skeletonSchedules;
    }
}
