import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';

class AppStore extends EventEmitter {
    constructor() {
        super();
        this.currentScheduleIndex = 0;
        this.customEvents = [];
        this.addedCourses = [];
        this.deletedCourses = [];
    }

    getCurrentScheduleIndex() {
        return this.currentScheduleIndex;
    }

    getAddedCourses() {
        return this.addedCourses;
    }

    getCustomEvents() {
        return this.customEvents;
    }

    handleActions(action) {
        switch (action.type) {
            case 'ADD_COURSE':
                this.addedCourses = this.addedCourses.concat(action.newCourse);
                this.emit('addedCoursesChange');
                break;
            case 'ADD_SECTION':
                this.addedCourses = this.addedCourses.map((course) => {
                    if (
                        course.section.sectionCode ===
                        action.newSection.section.sectionCode
                    )
                        return action.newSection;
                    else return course;
                });
                this.emit('addedCoursesChange');
                break;
            case 'DELETE_COURSE':
                break;
            case 'CHANGE_CURRENT_SCHEDULE':
                this.currentScheduleIndex = action.newScheduleIndex;
                this.emit('currentScheduleIndexChange');
                break;
        }
    }
}

const store = new AppStore();
dispatcher.register(store.handleActions.bind(store));
export default store;
