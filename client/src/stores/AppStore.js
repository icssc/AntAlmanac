import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';
import { calendarizeCourseEvents, calendarizeCustomEvents, calendarizeFinals } from './calenderizeHelpers';

class AppStore extends EventEmitter {
    constructor() {
        super();

        this.currentScheduleIndex = 0;
        this.customEvents = [];
        this.addedCourses = [];
        this.addedSectionCodes = { 0: new Set(), 1: new Set(), 2: new Set(), 3: new Set() };
        this.deletedCourses = [];
        this.snackbarMessage = '';
        this.snackbarVariant = 'info';
        this.snackbarDuration = 3000;
        this.snackbarPosition = { vertical: 'bottom', horizontal: 'left' };
        this.snackbarStyle = {};
        this.eventsInCalendar = [];
        this.finalsEventsInCalendar = [];
        this.unsavedChanges = false;

        let darkMode = null;
        if (typeof Storage !== 'undefined') darkMode = window.localStorage.getItem('DarkMode');

        window.addEventListener('beforeunload', (event) => {
            if (this.unsavedChanges) {
                event.returnValue = `Are you sure you want to leave? You have unsaved changes!`;
            }
        });

        this.darkMode = darkMode === null ? false : darkMode === 'true';
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

    getSnackbarPosition() {
        return this.snackbarPosition;
    }

    getSnackbarDuration() {
        return this.snackbarDuration;
    }

    getSnackbarStyle() {
        return this.snackbarStyle;
    }

    getDarkMode() {
        return this.darkMode;
    }

    getAddedSectionCodes() {
        return this.addedSectionCodes;
    }

    hasUnsavedChanges() {
        return this.unsavedChanges;
    }

    updateAddedSectionCodes() {
        this.addedSectionCodes = { 0: new Set(), 1: new Set(), 2: new Set(), 3: new Set() };
        for (const course of this.addedCourses) {
            for (const scheduleIndex of course.scheduleIndices) {
                this.addedSectionCodes[scheduleIndex].add(`${course.section.sectionCode} ${course.term}`);
            }
        }
    }

    handleActions(action) {
        switch (action.type) {
            case 'ADD_COURSE':
                this.addedCourses = this.addedCourses.concat(action.newCourse);
                this.updateAddedSectionCodes();
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
                this.unsavedChanges = true;
                this.emit('addedCoursesChange');
                break;
            case 'ADD_SECTION':
                this.addedCourses = this.addedCourses.map((course) => {
                    if (course.section.sectionCode === action.newSection.section.sectionCode) return action.newSection;
                    else return course;
                });
                this.updateAddedSectionCodes();
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
                this.unsavedChanges = true;
                this.emit('addedCoursesChange');
                break;
            case 'DELETE_COURSE':
                this.addedCourses = action.addedCoursesAfterDelete;
                this.updateAddedSectionCodes();
                this.deletedCourses = action.deletedCourses;
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
                this.unsavedChanges = true;
                this.emit('addedCoursesChange');
                break;
            case 'CHANGE_CURRENT_SCHEDULE':
                this.currentScheduleIndex = action.newScheduleIndex;
                this.emit('currentScheduleIndexChange');
                break;
            case 'UNDO_DELETE':
                this.deletedCourses = action.deletedCourses;
                this.unsavedChanges = true;
                break;
            case 'CLEAR_SCHEDULE':
                this.addedCourses = action.addedCoursesAfterClear;
                this.updateAddedSectionCodes();
                this.customEvents = action.customEventsAfterClear;
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
                this.unsavedChanges = true;
                this.emit('addedCoursesChange');
                this.emit('customEventsChange');
                break;
            case 'ADD_CUSTOM_EVENT':
                this.customEvents = this.customEvents.concat(action.customEvent);
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
                this.unsavedChanges = true;
                this.emit('customEventsChange');
                break;
            case 'DELETE_CUSTOM_EVENT':
                this.customEvents = action.customEventsAfterDelete;
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
                this.unsavedChanges = true;
                this.emit('customEventsChange');
                break;
            case 'COURSE_COLOR_CHANGE':
                this.addedCourses = action.addedCoursesAfterColorChange;
                this.updateAddedSectionCodes();
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
                this.unsavedChanges = true;
                this.emit('addedCoursesChange');
                break;
            case 'CUSTOM_EVENT_COLOR_CHANGE':
                this.customEvents = action.customEventsAfterColorChange;
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
                this.unsavedChanges = true;
                this.emit('customEventsChange');
                break;
            case 'LOAD_SCHEDULE':
                this.addedCourses = action.userData.addedCourses;
                this.updateAddedSectionCodes();
                this.customEvents = action.userData.customEvents;
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
                this.unsavedChanges = false;
                this.emit('addedCoursesChange');
                this.emit('customEventsChange');
                break;
            case 'SAVE_SCHEDULE':
                this.unsavedChanges = false;
                break;
            case 'OPEN_SNACKBAR':
                this.snackbarVariant = action.variant;
                this.snackbarMessage = action.message;
                this.snackbarDuration = action.duration ? action.duration : this.snackbarDuration;
                this.snackbarPosition = action.position ? action.position : this.snackbarPosition;
                this.snackbarStyle = action.style ? action.style : this.snackbarStyle;
                this.emit('openSnackbar');
                break;
            case 'EDIT_CUSTOM_EVENTS':
                this.customEvents = action.customEventsAfterEdit;
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
                this.unsavedChanges = true;
                this.emit('customEventsChange');
                break;
            case 'COPY_SCHEDULE':
                this.addedCourses = action.addedCoursesAfterCopy;
                this.updateAddedSectionCodes();
                this.customEvents = action.customEventsAfterCopy;
                this.finalsEventsInCalendar = calendarizeFinals();
                this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
                this.unsavedChanges = true;
                this.emit('addedCoursesChange');
                this.emit('customEventsChange');
                break;
            case 'TOGGLE_DARK_MODE':
                this.darkMode = action.darkMode;
                this.emit('darkModeToggle');
                window.localStorage.setItem('DarkMode', action.darkMode);
                break;
            default:
                console.log(`[Warning] AppStore invalid action type: ${action.type}`);
        }
    }
}

const store = new AppStore();
dispatcher.register(store.handleActions.bind(store));
export default store;
