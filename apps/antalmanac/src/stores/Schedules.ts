import { trpc } from '$lib/api/trpc';
import { getDefaultTerm, getTermByShortName } from '$lib/term';
import { moveArrayElements } from '$lib/utils';
import { calendarizeCourseEvents, calendarizeCustomEvents, calendarizeFinals } from '$stores/calendarizeHelpers';
import { useHiddenCoursesStore } from '$stores/HiddenCoursesStore';
import { getColorForNewSection, scheduleOfferingKey, scheduleSectionKey } from '$stores/scheduleHelpers';
import { openSnackbar } from '$stores/SnackbarStore';
import type {
    AATerm,
    AACourse,
    AACourseWithTerm,
    AASection,
    CustomEventId,
    RepeatingCustomEvent,
    Schedule,
    ScheduleSaveState,
    ScheduleUndoState,
    ShortCourseSchedule,
} from '@packages/antalmanac-types';
import { createId } from '@paralleldrive/cuid2';

/**
 * Manages state of schedules. Only one instance is really needed for the app.
 */
export class Schedules {
    private schedules: Schedule[];

    private currentScheduleIndex: number;

    private previousStates: ScheduleUndoState[];

    private futureStates: ScheduleUndoState[];

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
                scheduleName: getDefaultTerm().shortName,
                courses: [],
                customEvents: [],
                scheduleNoteId: scheduleNoteId,
                scheduleId: createId(),
            },
        ];
        this.currentScheduleIndex = 0;
        this.previousStates = [];
        this.futureStates = [];
        this.scheduleNoteMap = { [scheduleNoteId]: '' };
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
        return getDefaultTerm().shortName;
    }

    getCurrentScheduleIndex() {
        return this.currentScheduleIndex;
    }

    getCurrentSchedule() {
        return this.schedules[this.currentScheduleIndex];
    }

    getNumberOfSchedules() {
        return this.schedules.length;
    }

    getCurrentScheduleName() {
        return this.schedules[this.currentScheduleIndex].scheduleName;
    }

    getCurrentScheduleId() {
        return this.schedules[this.currentScheduleIndex].scheduleId;
    }

    getScheduleId(scheduleIndex: number) {
        return this.schedules[scheduleIndex]?.scheduleId;
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
            scheduleId: createId(),
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
        const previousIndex = this.currentScheduleIndex;
        this.addNewSchedule(newScheduleName);
        this.currentScheduleIndex = scheduleIndex; // temporarily set current schedule to the one being copied
        const to = this.getNumberOfSchedules() - 1;

        for (const course of this.getCurrentCourses()) {
            for (const section of course.sections) {
                this.addCourse(section, course, to, false);
            }
        }

        for (const customEvent of this.getCurrentCustomEvents()) {
            this.addCustomEvent(customEvent, [to], false);
        }
        this.currentScheduleIndex = previousIndex;
    }

    /**
     * Reorder schedules by moving a schedule from one index to another.
     * This modifies the order of schedules and updates the current schedule index to maintain the correct reference.
     */
    reorderSchedule(from: number, to: number) {
        this.addUndoState();
        moveArrayElements(this.schedules, from, to, { isShiftAccountedFor: true });
        if (this.currentScheduleIndex === from) {
            this.currentScheduleIndex = to;
        } else if (this.currentScheduleIndex > from && this.currentScheduleIndex <= to) {
            this.currentScheduleIndex -= 1;
        } else if (this.currentScheduleIndex < from && this.currentScheduleIndex >= to) {
            this.currentScheduleIndex += 1;
        }
    }

    /**
     * Moves a course from one position to another.
     *
     * @param scheduleIndex Index of the schedule to reorder courses for.
     * @param movedOfferingKey Offering key (`term::courseId::title`) of the course to move.
     * @param nextOfferingKey Offering key directly after the moved course after reordering.
     * Pass `null` if the course is being moved to the end.
     */
    reorderAddedCourses(scheduleIndex: number, movedOfferingKey: string, nextOfferingKey: string | null) {
        this.addUndoState();
        const courses = this.schedules[scheduleIndex].courses;

        const fromIndex = courses.findIndex((course) => scheduleOfferingKey(course) === movedOfferingKey);
        if (fromIndex === -1) {
            console.error(`Offering ${movedOfferingKey} was not found in schedule courses`);
            openSnackbar('error', 'Could not reorder added courses');
            return;
        }

        const toIndex =
            nextOfferingKey !== null
                ? courses.findIndex((course) => scheduleOfferingKey(course) === nextOfferingKey)
                : courses.length;
        if (toIndex === -1) {
            console.error(`Offering ${nextOfferingKey} was not found in schedule courses`);
            openSnackbar('error', 'Could not reorder added courses');
            return;
        }

        moveArrayElements(courses, fromIndex, toIndex);
    }

    getCurrentCourses() {
        return this.schedules[this.currentScheduleIndex]?.courses || [];
    }

    getAddedSectionCodes() {
        return new Set(
            this.getCurrentCourses().flatMap((course) =>
                course.sections.map((section) => scheduleSectionKey(course.term, section.sectionCode))
            )
        );
    }

    /**
     * Get combined list of courses from all schedules with duplicates.
     */
    getAllCourses() {
        return this.schedules.map((schedule) => schedule.courses).flat(1);
    }

    /**
     * Find a section across **all** schedules.
     * Returns the AASection reference so cross-schedule color sharing works.
     */
    private findSectionAcrossSchedules(sectionCode: string, term: AATerm): AASection | undefined {
        for (const schedule of this.schedules) {
            for (const course of schedule.courses) {
                if (course.term.shortName !== term.shortName) continue;
                const section = course.sections.find((s) => s.sectionCode === sectionCode);
                if (section) return section;
            }
        }
        return undefined;
    }

    /**
     * Find a section in the **current** schedule.
     */
    findSectionInSchedule(sectionCode: string, term: AATerm): AASection | undefined {
        for (const course of this.getCurrentCourses()) {
            if (course.term.shortName !== term.shortName) continue;
            const section = course.sections.find((s) => s.sectionCode === sectionCode);
            if (section) return section;
        }
        return undefined;
    }

    /**
     * Adds a section to a course in a given schedule index.
     * Groups sections under the same offering. Sets color to an unused color.
     * Will not add if the section already exists in the target schedule.
     *
     * @param section The section to add
     * @param course The course the section belongs to
     * @param scheduleIndex Target schedule index
     * @param addUndoState Defaults to true
     */
    addCourse(section: AASection, course: AACourseWithTerm, scheduleIndex: number, addUndoState = true) {
        if (addUndoState) {
            this.addUndoState();
        }

        // Already present in target schedule
        if (this.doesCourseExistInSchedule(section.sectionCode, course.term, scheduleIndex)) {
            return;
        }

        // Reuse existing section reference from any schedule for cross-schedule color sharing
        const existingSection = this.findSectionAcrossSchedules(section.sectionCode, course.term);

        const sectionToAdd = existingSection ?? {
            ...section,
            color: getColorForNewSection(
                section,
                course,
                this.getAllCourses().filter((c) => c.term.shortName === course.term.shortName)
            ),
        };

        const courses = this.schedules[scheduleIndex].courses;
        const offeringKey = scheduleOfferingKey(course);
        const existingCourse = courses.find((c) => scheduleOfferingKey(c) === offeringKey);

        if (existingCourse) {
            existingCourse.sections.push(sectionToAdd);
        } else {
            courses.push({
                term: course.term,
                deptCode: course.deptCode,
                courseNumber: course.courseNumber,
                courseId: course.courseId,
                courseTitle: course.courseTitle,
                courseComment: course.courseComment,
                prerequisiteLink: course.prerequisiteLink,
                sectionTypes: course.sectionTypes,
                sections: [sectionToAdd],
                updatedAt: course.updatedAt ?? null,
            });
        }
    }

    /**
     * Add a section to a course in every schedule.
     */
    addCourseToAllSchedules(section: AASection, course: AACourseWithTerm) {
        this.addUndoState();
        for (let i = 0; i < this.getNumberOfSchedules(); i++) {
            this.addCourse(section, course, i, false);
        }
    }

    /**
     * Change courses that match the code and term in all schedules to new color.
     * Iterates every schedule explicitly so color updates survive undo/redo
     * (structuredClone severs shared references).
     */
    changeCourseColor(sectionCode: string, term: AATerm, newColor: string) {
        this.addUndoState();

        for (const schedule of this.schedules) {
            for (const course of schedule.courses) {
                if (course.term.shortName !== term.shortName) continue;
                const section = course.sections.find((s) => s.sectionCode === sectionCode);
                if (section) {
                    section.color = newColor;
                }
            }
        }
    }

    /**
     * Delete a section from a course in the given schedule.
     * Removes the entire course if it has no sections left.
     */
    deleteCourse(sectionCode: string, term: AATerm, scheduleIndex: number) {
        this.addUndoState();
        const courses = this.schedules[scheduleIndex].courses;
        for (let i = 0; i < courses.length; i++) {
            const course = courses[i];
            if (course.term.shortName !== term.shortName) continue;
            const sectionIndex = course.sections.findIndex((s) => s.sectionCode === sectionCode);
            if (sectionIndex !== -1) {
                course.sections.splice(sectionIndex, 1);
                if (course.sections.length === 0) {
                    courses.splice(i, 1);
                }
                return;
            }
        }
    }

    /**
     * Check if a section has already been added to a schedule.
     */
    doesCourseExistInSchedule(sectionCode: string, term: AATerm, scheduleIndex: number) {
        for (const course of this.schedules[scheduleIndex].courses) {
            if (course.term.shortName !== term.shortName) continue;
            if (course.sections.some((s) => s.sectionCode === sectionCode)) {
                return true;
            }
        }
        return false;
    }

    getCurrentCustomEvents() {
        return this.schedules[this.currentScheduleIndex]?.customEvents || [];
    }

    /**
     * Get a reference to the custom event that matches the ID.
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
            if (index !== -1) {
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
        const clonedSchedules = structuredClone(this.schedules);
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
        const clonedSchedules = structuredClone(this.schedules);
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
        const clonedSchedules = structuredClone(this.schedules);
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
        const { getVisibility } = useHiddenCoursesStore.getState();
        const shortSchedules: ShortCourseSchedule[] = this.schedules.map((schedule) => {
            return {
                id: schedule.scheduleId,
                scheduleName: schedule.scheduleName,
                customEvents: schedule.customEvents,
                courses: schedule.courses.flatMap((course) =>
                    course.sections.map((section) => ({
                        color: section.color,
                        term: course.term.shortName,
                        sectionCode: section.sectionCode,
                        visibility: getVisibility(schedule.scheduleId, course.term, section.sectionCode),
                    }))
                ),
                scheduleNote: this.scheduleNoteMap[schedule.scheduleNoteId],
            };
        });
        return { schedules: shortSchedules, scheduleIndex: this.currentScheduleIndex };
    }

    /**
     * Updates the persistent DB schedule IDs in the store after a successful save.
     * This ensures subsequent saves can update in-place rather than re-inserting.
     *
     * Keyed by frontend CUID (the id each schedule had when the save request was
     * sent) rather than by array position. Position-based mapping is unsafe because
     * the user may have reordered or added a schedule while the request was
     * in-flight, which would write the returned DB IDs to the wrong slots.
     */
    updateScheduleIds(scheduleIdMap: Record<string, string>) {
        for (const schedule of this.schedules) {
            const dbId = scheduleIdMap[schedule.scheduleId];
            if (dbId !== undefined) {
                schedule.scheduleId = dbId;
            }
        }
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
            const courseInfoDict = new Map<string, Record<string, AACourse>>();

            const websocRequests = Object.entries(courseDict).map(async ([termShortName, courseSet]) => {
                const term = getTermByShortName(termShortName);
                if (!term) {
                    return;
                }

                const sectionCodes = Array.from(courseSet).join(',');
                const courseInfo = await trpc.websoc.getCourseInfo.query({
                    year: term.year,
                    quarter: term.quarter,
                    sectionCodes,
                });
                courseInfoDict.set(termShortName, courseInfo);
            });

            await Promise.all(websocRequests);

            this.schedules.length = 0;
            this.currentScheduleIndex = saveState.scheduleIndex;

            // Map course info to courses and group sections by offering
            for (const shortCourseSchedule of saveState.schedules) {
                const groupedCourses: AACourseWithTerm[] = [];
                for (const shortCourse of shortCourseSchedule.courses) {
                    const courseInfoMap = courseInfoDict.get(shortCourse.term);
                    if (courseInfoMap !== undefined) {
                        const sectionCode = shortCourse.sectionCode.padStart(5, '0');
                        const course = courseInfoMap[sectionCode];
                        if (course === undefined) {
                            // Class doesn't exist/was cancelled
                            continue;
                        }

                        const section = course.sections.find((s) => s.sectionCode === sectionCode);
                        if (section === undefined) {
                            continue;
                        }

                        const term = getTermByShortName(shortCourse.term);
                        if (!term) {
                            continue;
                        }

                        const aaSection: AASection = { ...section, color: shortCourse.color };

                        // Group into existing course or create new one
                        const offeringKey = scheduleOfferingKey({
                            term,
                            courseId: course.courseId,
                            courseTitle: course.courseTitle,
                        });
                        const existingCourse = groupedCourses.find((c) => scheduleOfferingKey(c) === offeringKey);
                        if (existingCourse) {
                            existingCourse.sections.push(aaSection);
                        } else {
                            groupedCourses.push({
                                term,
                                deptCode: course.deptCode,
                                courseNumber: course.courseNumber,
                                courseId: course.courseId,
                                courseTitle: course.courseTitle,
                                courseComment: course.courseComment,
                                prerequisiteLink: course.prerequisiteLink,
                                sectionTypes: course.sectionTypes,
                                sections: [aaSection],
                                updatedAt: course.updatedAt ?? null,
                            });
                        }
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
                    courses: groupedCourses,
                    customEvents: shortCourseSchedule.customEvents,
                    scheduleNoteId: scheduleNoteId,
                    scheduleId: shortCourseSchedule.id ?? createId(),
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
}
