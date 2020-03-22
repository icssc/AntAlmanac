import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';
import {
    calendarizeCourseEvents,
    calendarizeCustomEvents,
    calendarizeFinals,
} from './calenderizeHelpers';

class AppStore extends EventEmitter {
    constructor() {
        super();
        this.currentScheduleIndex = 0;
        this.customEvents = [];
        this.addedCourses = [];
        this.deletedCourses = [];
        this.snackbarMessage = '';
        this.snackbarVariant = 'info';

        this.eventsInCalendar = [];
        this.finalsEventsInCalendar = [];
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

    getEventsInCalendar() {
        return this.eventsInCalendar;
    }

    getFinalEventsInCalendar() {
        return this.finalsEventsInCalendar;
    }

    getDeletedCourses() {
        return this.deletedCourses;
    }

    getSnackbarMessage() {
        return this.snackbarMessage;
    }

    getSnackbarVariant() {
        return this.snackbarVariant;
    }

    handleActions(action) {
        switch (action.type) {
            case 'ADD_COURSE':
                this.addedCourses = this.addedCourses.concat(action.newCourse);
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(
                    calendarizeCustomEvents()
                );
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
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(
                    calendarizeCustomEvents()
                );
                this.emit('addedCoursesChange');
                break;
            case 'DELETE_COURSE':
                this.addedCourses = action.addedCoursesAfterDelete;
                this.deletedCourses = action.deletedCourses;
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(
                    calendarizeCustomEvents()
                );
                this.emit('addedCoursesChange');
                break;
            case 'CHANGE_CURRENT_SCHEDULE':
                this.currentScheduleIndex = action.newScheduleIndex;
                this.emit('currentScheduleIndexChange');
                break;
            case 'UNDO_DELETE':
                this.deletedCourses = action.deletedCourses;
                break;
            case 'CLEAR_SCHEDULE':
                this.addedCourses = action.addedCoursesAfterClear;
                this.customEvents = action.customEventsAfterClear;
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(
                    calendarizeCustomEvents()
                );
                this.emit('addedCoursesChange');
                this.emit('customEventsChange');
                break;
            case 'ADD_CUSTOM_EVENT':
                this.customEvents = this.customEvents.concat(
                    action.customEvent
                );
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(
                    calendarizeCustomEvents()
                );
                this.emit('customEventsChange');
                break;
            case 'DELETE_CUSTOM_EVENT':
                this.customEvents = action.customEventsAfterDelete;
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(
                    calendarizeCustomEvents()
                );
                this.emit('customEventsChange');
                break;
            case 'COURSE_COLOR_CHANGE':
                this.addedCourses = action.addedCoursesAfterColorChange;
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(
                    calendarizeCustomEvents()
                );
                this.emit('addedCoursesChange');
                break;
            case 'CUSTOM_EVENT_COLOR_CHANGE':
                this.customEvents = action.customEventsAfterColorChange;
                this.emit('customEventsChange');
                break;
            case 'LOAD_SCHEDULE':
                this.addedCourses = action.userData.addedCourses;
                this.customEvents = action.userData.customEvents;
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(
                    calendarizeCustomEvents()
                );
                this.emit('addedCoursesChange');
                this.emit('customEventsChange');
                break;
            case 'OPEN_SNACKBAR':
                this.snackbarVariant = action.variant;
                this.snackbarMessage = action.message;
                this.emit('openSnackbar');
                break;
            case 'EDIT_CUSTOM_EVENTS':
                this.customEvents = action.customEventsAfterEdit;
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(
                    calendarizeCustomEvents()
                );
                this.emit('customEventsChange');
                break;
            case 'COPY_SCHEDULE':
                this.addedCourses = action.addedCoursesAfterCopy;
                this.customEvents = action.customEventsAfterCopy;
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(
                    calendarizeCustomEvents()
                );
                this.emit('addedCoursesChange');
                this.emit('customEventsChange');
                break;
        }
    }
}

const store = new AppStore();
dispatcher.register(store.handleActions.bind(store));
export default store;
