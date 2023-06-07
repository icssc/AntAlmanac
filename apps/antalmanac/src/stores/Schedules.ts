import { amber, blue, deepOrange, deepPurple, green, pink, purple } from '@material-ui/core/colors';

import { calendarizeCourseEvents, calendarizeCustomEvents, calendarizeFinals } from './calendarizeHelpers';
import {
    HSLColor,
    Schedule,
    ScheduleCourse,
    ScheduleSaveState,
    ScheduleUndoState,
    ShortCourseSchedule,
} from './schedule.types';
import AppStore from './AppStore';
import { RepeatingCustomEvent } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import { combineSOCObjects, CourseInfo, getCourseInfo, queryWebsoc } from '$lib/helpers';
import { openSnackbar } from '$actions/AppStoreActions';

const defaultColors = [blue[500], pink[500], purple[500], green[500], amber[500], deepPurple[500], deepOrange[500]];

/**
 * Converts a hex color to HSL
 * Assumes the hex color is in the format #RRGGBB
 * Adapted from https://stackoverflow.com/a/9493060
 *
 * @param hex str: hex string representation of a color
 *
 * @return An HSLColor object where h, s, and l are in the range [0, 1]
 */
function HexToHSL(hex: string): HSLColor {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (!result) {
        throw new Error('Could not parse Hex Color');
    }

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let h,
        s,
        l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
            default:
                throw new Error('Error converting hex to hsl');
        }
        h /= 6;
    }

    [h, s, l] = [h, s, l].map((val: number) => Math.round(val * 100) / 100);

    return { h, s, l };
}

/**
 * Converts HSL color in the range [0, 1] to a hex string ("#RRGGBB")
 * Adapted from https://stackoverflow.com/a/9493060
 */
function HSLToHex({ h, s, l }: HSLColor): string {
    // Check that h, s, and l are in the range [0, 1]
    if (h < 0 || h > 1 || s < 0 || s > 1 || l < 0 || l > 1) {
        throw new Error('Invalid HSLColor');
    }

    let r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = function hue2rgb(p: number, q: number, t: number) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    [r, g, b] = [r, g, b].map((x) =>
        Math.round(x * 255)
            .toString(16)
            .padStart(2, '0')
    );

    return `#${r}${g}${b}`;
}

/**
 * Checks if an HSL color is contained in an array of colors, within a delta
 */
function colorIsContained(color: HSLColor, usedColors: Iterable<HSLColor>, delta: number): boolean {
    for (const usedColor of usedColors) {
        if (
            Math.abs(usedColor.h - color.h) < delta &&
            Math.abs(usedColor.s - color.s) < delta &&
            Math.abs(usedColor.l - color.l) < delta
        )
            return true;
    }
    return false;
}

/**
 * Takes in a hex color and returns a hex color that is close to the original but not already used.
 * Takes changes the lightness of the color by a small amount until a color that is not already used is found.
 *
 * @param originalColor string: Hex color ("#RRGGBB") as a basis.
 * @param usedColors Set<string>: A set of hex colors that are already used.
 * @param variation number [0-1]: The step size to use when generating a new color.
 *      The bigger the number, the more different the new color will be.
 *
 * @return Unused hex color that is close to the original color ("#RRGGBB").
 */
function generateCloseColor(originalColor: string, usedColors: Set<string>, variation = 0.1): string {
    const usedColorsHSL = [...usedColors].map(HexToHSL);

    // Generate a color that is slightly different from the original color and that is not already used
    // Keep generating until color doesn't match any of the used colors
    let color: HSLColor = HexToHSL(originalColor);

    for (
        let delta = variation;
        colorIsContained(color, usedColorsHSL, 0.01); // Checks if color is contained in usedColorsHSL
        delta += variation
    ) {
        color = {
            ...color,
            l: Math.round(((color.l + delta) * 100) % 100) / 100,
        };
    }

    return HSLToHex(color);
}

function getColorForNewSection(newSection: ScheduleCourse, sectionsInSchedule: ScheduleCourse[]): string {
    // Use the color of the closest section with the same title

    // Array of sections that have the same course title (i.e., they're under the same course),
    // sorted by their distance from the new section's section code
    const existingSections: Array<ScheduleCourse> = sectionsInSchedule
        .filter((course) => course.courseTitle === newSection.courseTitle)
        .sort(
            // Sort by distance from new section's section code
            (a, b) =>
                Math.abs(parseInt(a.section.sectionCode) - parseInt(newSection.section.sectionCode)) -
                Math.abs(parseInt(b.section.sectionCode) - parseInt(newSection.section.sectionCode))
        );

    //New array of courses that share the same sectionType & courseTitle
    const existingSectionsType = existingSections.filter(
        (course) => course.section.sectionType === newSection.section.sectionType
    );

    const usedColors = new Set(sectionsInSchedule.map((course) => course.section.color));

    //If the same sectionType exists, return that color
    if (existingSectionsType.length > 0) return existingSectionsType[0].section.color;

    //If the same courseTitle exists, but not the same sectionType, return a close color
    if (existingSections.length > 0) return generateCloseColor(existingSections[0].section.color, usedColors);

    // If there are no existing sections with the same course title, generate a new color
    return defaultColors.find((materialColor) => !usedColors.has(materialColor)) || '#5ec8e0';
}

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
            try {
                for (const [term, courseSet] of Object.entries(courseDict)) {
                    const sectionCodes = Array.from(courseSet);
                    // Code from ImportStudyList
                    const courseInfo = getCourseInfo(
                        combineSOCObjects(
                            await Promise.all(
                                sectionCodes
                                    .reduce((result: string[][], item, index) => {
                                        // WebSOC queries can have a maximum of 10 course codes in tandem
                                        const chunkIndex = Math.floor(index / 10);
                                        result[chunkIndex]
                                            ? result[chunkIndex].push(item)
                                            : (result[chunkIndex] = [item]);
                                        return result;
                                    }, []) // https://stackoverflow.com/a/37826698
                                    .map((sectionCode: string[]) =>
                                        queryWebsoc({
                                            term: term,
                                            sectionCodes: sectionCode.join(','),
                                        })
                                    )
                            )
                        )
                    );
                    courseInfoDict.set(term, courseInfo);
                }
            } catch (error) {
                console.error(error);
                openSnackbar('error', 'Could not retrieve course information.');
                AppStore.loadSkeletonSchedule(saveState);
                return;
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

    getSkeletonSchedule(): ShortCourseSchedule {
        return this.skeletonSchedules[this.currentScheduleIndex];
    }

    setSkeletonSchedules(skeletonSchedules: ShortCourseSchedule[]) {
        this.skeletonSchedules = skeletonSchedules;
    }
}
