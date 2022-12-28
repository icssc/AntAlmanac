import {AppStoreCourse} from "./AppStore";

export interface Schedule {
    scheduleName: string
    courses: AppStoreCourse[]
    // TODO: Figure out custom events
    // customEvents: RepeatingCustomEvent[]
}

export class Schedules {
    private schedules: Schedule[]
    private currentScheduleIndex: number

    constructor() {
        this.schedules = [{scheduleName: 'Schedule 1', courses: []}]
        this.currentScheduleIndex = 0
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

    getCurrentScheduleName() {
        return this.schedules[this.currentScheduleIndex].scheduleName
    }

    getAddedSectionCodes() {
        return new Set(this.getCurrentCourses().map((course) => `${course.section.sectionCode} ${course.term}`))
    }

    getAllCourses() {
        return this.schedules.map(schedule => schedule.courses).flat(1)
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

    deleteCourse(sectionCode: string, term: string){
        this.schedules[this.currentScheduleIndex].courses = this.getCurrentCourses().filter((course) => {
            return !(course.section.sectionCode === sectionCode && course.term === term)
        })
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

    addSchedule(newScheduleName: string) {
        this.schedules.push({scheduleName: newScheduleName, courses: []})
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
}
