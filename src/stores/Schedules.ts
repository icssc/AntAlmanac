import { AppStoreCourse } from './AppStore';
import { RepeatingCustomEvent } from '../components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
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
import { getCourseInfo, queryWebsoc } from '../helpers';

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

export interface Schedule {
    scheduleName: string;
    courses: AppStoreCourse[];
    customEvents: RepeatingCustomEvent[];
}

interface ShortCourseInfo {
    color: string;
    term: string;
    sectionCode: string;
}

interface ShortCourseSchedule {
    scheduleName: string;
    courses: ShortCourseInfo[];
    customEvents: RepeatingCustomEvent[];
}

export interface ScheduleSaveState {
    schedules: ShortCourseSchedule[];
    scheduleIndex: number;
}

interface ScheduleUndoState {
    schedules: Schedule[];
    scheduleIndex: number;
}

export class Schedules {
    private schedules: Schedule[];
    private currentScheduleIndex: number;
    private previousStates: ScheduleUndoState[];

    constructor() {
        this.schedules = [{ scheduleName: 'Schedule 1', courses: [], customEvents: [] }];
        this.currentScheduleIndex = 0;
        this.previousStates = [];
    }

    setCurrentScheduleIndex(newScheduleIndex: number) {
        this.addUndoState();
        this.currentScheduleIndex = newScheduleIndex;
    }

    getNumberOfSchedules() {
        return this.schedules.length
    }

    getScheduleNames() {
        return this.schedules.map(schedule => schedule.scheduleName)
    }

    getCurrentCourses() {
        return this.schedules[this.currentScheduleIndex].courses
    }

    getCurrentCustomEvents() {
        return this.schedules[this.currentScheduleIndex].customEvents;
    }

    getCurrentScheduleName() {
        return this.schedules[this.currentScheduleIndex].scheduleName
    }

    getAddedSectionCodes() {
        return new Set(this.getCurrentCourses().map((course) => `${course.section.sectionCode} ${course.term}`))
    }

    getAllCourses() {
        return this.schedules.map(schedule => schedule.courses).flat(1)
    }

    getAllCustomEvents() {
        return this.schedules.map((schedule) => schedule.customEvents).flat(1);
    }

    getCurrentScheduleIndex() {
        return this.currentScheduleIndex
    }

    getExistingCourse(sectionCode: string, term: string) {
        // Get the first instance of a course that matches the parameters
        for (const course of this.getAllCourses()) {
            if (course.section.sectionCode === sectionCode && term === course.term) {
                return course
            }
        }
        return undefined;
    }

    getExistingCustomEvent(customEventId: number) {
        // Get the first instance of a custom event that matches the parameters
        for (const customEvent of this.getAllCustomEvents()) {
            if (customEvent.customEventID === customEventId) {
                return customEvent;
            }
        }
        return undefined;
    }

    getIndexesOfCustomEvent(customEventId: number) {
        const indices: number[] = [];
        for (const scheduleIndex of this.schedules.keys()) {
            if (this.doesCustomEventExistInSchedule(customEventId, scheduleIndex)) {
                indices.push(scheduleIndex);
            }
        }
        return indices;
    }

    addCourse(
        newCourse: AppStoreCourse,
        scheduleIndex: number = this.getCurrentScheduleIndex(),
        addUndoState: boolean = true
    ) {
        if (addUndoState) {
            this.addUndoState();
        }
        let courseToAdd = this.getExistingCourse(newCourse.section.sectionCode, newCourse.term);
        if (courseToAdd === undefined) {
            const setOfUsedColors = new Set(this.getAllCourses().map((course) => course.section.color));

            let color: string =
                arrayOfColors.find((materialColor) => {
                    if (!setOfUsedColors.has(materialColor)) return materialColor;
                    else return undefined;
                }) ?? '#5ec8e0';
            courseToAdd = newCourse;
            courseToAdd.section.color = color;
        }

        if (!this.doesCourseExistInSchedule(newCourse.section.sectionCode, newCourse.term, scheduleIndex)) {
            this.schedules[scheduleIndex].courses.push(courseToAdd);
        }
    }

    addCourseToAllSchedules(newCourse: AppStoreCourse) {
        this.addUndoState();
        for (let i = 0; i < this.getNumberOfSchedules(); i++) {
            this.addCourse(newCourse, i, false);
        }
    }

    addCustomEvent(newCustomEvent: RepeatingCustomEvent, scheduleIndices: number[]) {
        this.addUndoState();
        for (const scheduleIndex of scheduleIndices) {
            if (!this.doesCustomEventExistInSchedule(newCustomEvent.customEventID, scheduleIndex)) {
                this.schedules[scheduleIndex].customEvents.push(newCustomEvent);
            }
        }
    }

    deleteCourse(sectionCode: string, term: string) {
        this.addUndoState();
        this.schedules[this.currentScheduleIndex].courses = this.getCurrentCourses().filter((course) => {
            return !(course.section.sectionCode === sectionCode && course.term === term)
        })
    }

    deleteCustomEvent(customEventId: number, scheduleIndices: number[] = [this.getCurrentScheduleIndex()]) {
        this.addUndoState();
        for (const scheduleIndex of scheduleIndices) {
            const currentCustomEvents = this.schedules[scheduleIndex].customEvents;
            const index = currentCustomEvents.findIndex((customEvent) => customEvent.customEventID === customEventId);
            if (index !== undefined) {
                currentCustomEvents.splice(index, 1);
            }
        }
    }

    deleteCurrentSchedule() {
        this.addUndoState();
        this.schedules.splice(this.currentScheduleIndex, 1);
        this.currentScheduleIndex = Math.min(this.currentScheduleIndex, this.getNumberOfSchedules() - 1);
    }

    clearCurrentSchedule() {
        this.addUndoState();
        this.getCurrentCourses().length = 0;
    }

    changeCourseColor(sectionCode: string, term: string, newColor: string) {
        this.addUndoState();
        const course = this.getExistingCourse(sectionCode, term);
        if (course) {
            course.section.color = newColor;
        }
    }

    changeCustomEventColor(customEventId: number, newColor: string) {
        this.addUndoState();
        const customEvent = this.getExistingCustomEvent(customEventId);
        if (customEvent) {
            customEvent.color = newColor;
        }
    }

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

    addSchedule(newScheduleName: string) {
        this.addUndoState();
        this.schedules.push({ scheduleName: newScheduleName, courses: [], customEvents: [] });
        // Do not use the setScheduleIndex otherwise 2 undo states are added
        this.currentScheduleIndex = this.getNumberOfSchedules() - 1;
    }

    renameSchedule(newScheduleName: string, scheduleIndex: number) {
        this.addUndoState();
        this.schedules[scheduleIndex].scheduleName = newScheduleName;
    }

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

    doesCourseExistInSchedule(sectionCode: string, term: string, scheduleIndex: number) {
        for (const course of this.schedules[scheduleIndex].courses) {
            if (course.section.sectionCode === sectionCode && term === course.term) {
                return true
            }
        }
        return false;
    }

    doesCustomEventExistInSchedule(customEventId: number, scheduleIndex: number) {
        for (const customEvent of this.schedules[scheduleIndex].customEvents) {
            if (customEvent.customEventID === customEventId) {
                return true;
            }
        }
        return false;
    }

    addUndoState() {
        const clonedSchedules = JSON.parse(JSON.stringify(this.schedules));
        this.previousStates.push({ schedules: clonedSchedules, scheduleIndex: this.currentScheduleIndex });
        if (this.previousStates.length >= 100) {
            this.previousStates.shift();
        }
    }

    revertState() {
        /**
         * Reverts: setCurrentScheduleIndex, addCourse, addCourseToAllSchedules, addCustomEvent, deleteCourse,
         *          deleteCustomEvent, deleteCourse, deleteCurrentSchedule, clearCurrentSchedule, changeCourseColor,
         *          changeCustomEventColor, editCustomEvent, addSchedule, renameSchedule, fromScheduleSaveState
         */
        const state = this.previousStates.pop();
        if (state !== undefined) {
            // Object.assign(this.schedules, state.schedules)
            this.schedules = state.schedules;
            this.currentScheduleIndex = state.scheduleIndex;
        }
    }

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

    async fromScheduleSaveState(saveState: ScheduleSaveState) {
        this.addUndoState();
        try {
            this.currentScheduleIndex = saveState.scheduleIndex;
            this.schedules = await Promise.all(
                saveState.schedules.map(async (shortCourseSchedule) => {
                    return {
                        ...shortCourseSchedule,
                        courses: await Promise.all(
                            shortCourseSchedule.courses.map(async (shortCourse) => {
                                const jsonResp = await queryWebsoc({
                                    term: shortCourse.term,
                                    sectionCodes: shortCourse.sectionCode,
                                });
                                const courseInfo = getCourseInfo(jsonResp)[shortCourse.sectionCode];
                                return {
                                    ...shortCourse,
                                    ...courseInfo.courseDetails,
                                    section: {
                                        ...courseInfo.section,
                                        color: shortCourse.color,
                                    },
                                };
                            })
                        ),
                    };
                })
            );
        } catch (e) {
            this.revertState();
            throw new Error('Unable to load schedule');
        }
    }
}
