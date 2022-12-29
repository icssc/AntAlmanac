import { AppStoreCourse } from './AppStore';
import { RepeatingCustomEvent } from '../components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import { addCustomEvent } from '../actions/AppStoreActions';

export interface Schedule {
    scheduleName: string;
    courses: AppStoreCourse[];
    customEvents: RepeatingCustomEvent[];
}

export class Schedules {
    private schedules: Schedule[]
    private currentScheduleIndex: number

    constructor() {
        this.schedules = [{ scheduleName: 'Schedule 1', courses: [], customEvents: [] }];
        this.currentScheduleIndex = 0;
    }

    setCurrentScheduleIndex(newScheduleIndex: number) {
        this.currentScheduleIndex = newScheduleIndex
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

    addCourse(newCourse: AppStoreCourse, scheduleIndex: number = this.getCurrentScheduleIndex()) {
        if (!this.doesCourseExistInCurrentSchedule(newCourse.section.sectionCode, newCourse.term)){
            this.schedules[scheduleIndex].courses.push(newCourse)
        }
    }

    addCourseToAllSchedules(newCourse: AppStoreCourse){
        for (let i = 0; i < this.getNumberOfSchedules(); i++){
            this.addCourse(newCourse, i)
        }
    }

    addCustomEvent(newCustomEvent: RepeatingCustomEvent, scheduleIndices: number[]) {
        for (const scheduleIndex of scheduleIndices) {
            if (!this.doesCustomEventExistInSchedule(newCustomEvent.customEventID, scheduleIndex)) {
                this.schedules[scheduleIndex].customEvents.push(newCustomEvent);
            }
        }
    }

    deleteCourse(sectionCode: string, term: string) {
        this.schedules[this.currentScheduleIndex].courses = this.getCurrentCourses().filter((course) => {
            return !(course.section.sectionCode === sectionCode && course.term === term)
        })
    }

    deleteCustomEvent(customEventId: number, scheduleIndices: number[] = [this.getCurrentScheduleIndex()]) {
        for (const scheduleIndex of scheduleIndices) {
            const currentCustomEvents = this.schedules[scheduleIndex].customEvents;
            const index = currentCustomEvents.findIndex((customEvent) => customEvent.customEventID === customEventId);
            if (index !== undefined) {
                currentCustomEvents.splice(index, 1);
            }
        }
    }

    deleteCurrentSchedule() {
        this.schedules.splice(this.currentScheduleIndex, 1);
        this.currentScheduleIndex = Math.min(this.currentScheduleIndex, this.getNumberOfSchedules() - 1);
    }

    clearCurrentSchedule() {
        this.getCurrentCourses().length = 0;
    }

    changeCourseColor(sectionCode: string, term: string, newColor: string) {
        const course = this.getExistingCourse(sectionCode, term);
        if (course) {
            course.color = newColor;
        }
    }

    editCustomEvent(editedCustomEvent: RepeatingCustomEvent, newIndices: number[]) {
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
        this.schedules.push({ scheduleName: newScheduleName, courses: [], customEvents: [] });
    }

    renameSchedule(newScheduleName: string, scheduleIndex: number) {
        this.schedules[scheduleIndex].scheduleName = newScheduleName
    }

    doesCourseExistInCurrentSchedule(sectionCode: string, term: string){
        for (const course of this.getCurrentCourses()) {
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
}
