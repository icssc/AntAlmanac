import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';
import { calendarizeCourseEvents, calendarizeCustomEvents, calendarizeFinals } from './calenderizeHelpers';

class AppStore extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(300); //this number is big because every section on the search results page listens to two events each.
        this.currentScheduleIndex = 0;
        this.customEvents = [];
        this.addedCourses = [];
        this.addedSectionCodes = { 0: new Set() };
        this.colorPickers = {};
        this.deletedCourses = [];
        this.snackbarMessage = '';
        this.snackbarVariant = 'info';
        this.snackbarDuration = 3000;
        this.snackbarPosition = { vertical: 'bottom', horizontal: 'left' };
        this.snackbarStyle = {};
        this.eventsInCalendar = [];
        this.finalsEventsInCalendar = [];
        this.unsavedChanges = false;
        this.scheduleNames = ['Schedule 1'];
        this.theme = (() => {
            // either 'light', 'dark', or 'auto'
            const theme = typeof Storage === 'undefined' ? 'auto' : window.localStorage.getItem('theme');
            return theme === null ? 'auto' : theme;
        })();

        window.addEventListener('beforeunload', (event) => {
            if (this.unsavedChanges) {
                event.returnValue = `Are you sure you want to leave? You have unsaved changes!`;
            }
        });
    }

    getCurrentScheduleIndex() {
        return this.currentScheduleIndex;
    }

    getScheduleNames() {
        return this.scheduleNames;
    }

    getAddedCourses() {
        return this.addedCourses;
    }

    addCourse(newCourse) {
        this.addedCourses = this.addedCourses.concat(newCourse);
        this.updateAddedSectionCodes();
        this.finalsEventsInCalendar = calendarizeFinals();
        this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
        this.unsavedChanges = true;
        this.emit('addedCoursesChange');
    }

    addSection(newSection) {
        this.addedCourses = this.addedCourses.map((course) => {
            if (course.section.sectionCode === newSection.section.sectionCode) return newSection;
            else return course;
        });
        this.updateAddedSectionCodes();
        this.finalsEventsInCalendar = calendarizeFinals();
        this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
        this.unsavedChanges = true;
        this.emit('addedCoursesChange');
    }

    getCustomEvents() {
        // Note: remove this forEach loop after Spring 2022 ends
        this.customEvents.forEach((customEvent) => {
            if (customEvent.days.length === 5) {
                customEvent.days = [false, ...customEvent.days, false];
            } else if (customEvent.days.length === 6) {
                customEvent.days = [...customEvent.days, false];
            }
        });

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

    getTheme() {
        return this.theme;
    }

    getAddedSectionCodes() {
        return this.addedSectionCodes;
    }

    hasUnsavedChanges() {
        return this.unsavedChanges;
    }

    updateAddedSectionCodes() {
        this.addedSectionCodes = {};

        for (let i = 0; i < this.scheduleNames.length; i++) {
            this.addedSectionCodes[i] = new Set();
        }

        for (const course of this.addedCourses) {
            for (const scheduleIndex of course.scheduleIndices) {
                this.addedSectionCodes[scheduleIndex].add(`${course.section.sectionCode} ${course.term}`);
            }
        }
    }

    registerColorPicker(id, update) {
        if (id in this.colorPickers) {
            this.colorPickers[id].on('colorChange', update);
        } else {
            this.colorPickers[id] = new EventEmitter();
            this.colorPickers[id].on('colorChange', update);
        }
    }
    unregisterColorPicker(id, update) {
        if (id in this.colorPickers) {
            this.colorPickers[id].removeListener('colorChange', update);
            if (this.colorPickers[id].listenerCount('colorChange') === 0) {
                delete this.colorPickers[id];
            }
        }
    }

    deleteCourse(addedCoursesAfterDelete, deletedCourses) {
        this.addedCourses = addedCoursesAfterDelete;
        this.updateAddedSectionCodes();
        this.deletedCourses = deletedCourses;
        this.finalsEventsInCalendar = calendarizeFinals();
        this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
        this.unsavedChanges = true;
        this.emit('addedCoursesChange');
    }

    undoDelete(deletedCourses) {
        this.deletedCourses = deletedCourses;
        this.unsavedChanges = true;
    }

    addCustomEvent(customEvent) {
        this.customEvents = this.customEvents.concat(customEvent);
        this.finalsEventsInCalendar = calendarizeFinals();
        this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
        this.unsavedChanges = true;
        this.emit('customEventsChange');
    }

    editCustomEvent(customEventsAfterEdit) {
        this.customEvents = customEventsAfterEdit;
        this.finalsEventsInCalendar = calendarizeFinals();
        this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
        this.unsavedChanges = true;
        this.emit('customEventsChange');
    }

    deleteCustomEvent(customEventsAfterDelete) {
        this.customEvents = customEventsAfterDelete;
        this.finalsEventsInCalendar = calendarizeFinals();
        this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
        this.unsavedChanges = true;
        this.emit('customEventsChange');
    }

    changeCustomEventColor(customEventsAfterColorChange, customEventID, newColor) {
        this.customEvents = customEventsAfterColorChange;
        this.finalsEventsInCalendar = calendarizeFinals();
        this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
        this.unsavedChanges = true;
        this.colorPickers[customEventID].emit('colorChange', newColor);
        this.emit('colorChange', false);
    }

    addSchedule(newScheduleNames) {
        // If the user adds a schedule, update the array of schedule names, add
        // another key/value pair to keep track of the section codes for that schedule,
        // and redirect the user to the new schedule
        this.scheduleNames = newScheduleNames;
        this.addedSectionCodes[newScheduleNames.length - 1] = new Set();
        this.currentScheduleIndex = newScheduleNames.length - 1;
        this.emit('scheduleNamesChange');
        this.emit('currentScheduleIndexChange');
    }

    renameSchedule(newScheduleNames) {
        this.scheduleNames = newScheduleNames;
        this.emit('scheduleNamesChange');
    }

    saveSchedule() {
        this.unsavedChanges = false;
    }

    copySchedule(addedCoursesAfterCopy, customEventsAfterCopy) {
        this.addedCourses = addedCoursesAfterCopy;
        this.updateAddedSectionCodes();
        this.customEvents = customEventsAfterCopy;
        this.finalsEventsInCalendar = calendarizeFinals();
        this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
        this.unsavedChanges = true;
        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
    }

    loadSchedule(userData) {
        this.addedCourses = userData.addedCourses;
        this.scheduleNames = userData.scheduleNames;
        this.updateAddedSectionCodes();
        this.customEvents = userData.customEvents;
        this.finalsEventsInCalendar = calendarizeFinals();
        this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
        this.unsavedChanges = false;
        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
        this.emit('scheduleNamesChange');
    }

    changeCurrentSchedule(newScheduleIndex) {
        this.currentScheduleIndex = newScheduleIndex;
        this.emit('currentScheduleIndexChange');
    }

    clearSchedule(addedCoursesAfterClear, customEventsAfterClear) {
        this.addedCourses = addedCoursesAfterClear;
        this.updateAddedSectionCodes();
        this.customEvents = customEventsAfterClear;
        this.finalsEventsInCalendar = calendarizeFinals();
        this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
        this.unsavedChanges = true;
        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
    }

    deleteSchedule(newScheduleNames, newAddedCourses, newCustomEvents, newScheduleIndex) {
        this.scheduleNames = newScheduleNames;
        this.addedCourses = newAddedCourses;
        this.updateAddedSectionCodes();
        this.customEvents = newCustomEvents;
        this.currentScheduleIndex = newScheduleIndex;
        this.finalsEventsInCalendar = calendarizeFinals();
        this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
        this.emit('scheduleNamesChange');
        this.emit('currentScheduleIndexChange');
        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
    }

    changeCourseColor(addedCoursesAfterColorChange, sectionCode, newColor) {
        this.addedCourses = addedCoursesAfterColorChange;
        this.updateAddedSectionCodes();
        this.finalsEventsInCalendar = calendarizeFinals();
        this.eventsInCalendar = calendarizeCourseEvents().concat(calendarizeCustomEvents());
        this.unsavedChanges = true;
        this.colorPickers[sectionCode].emit('colorChange', newColor);
        this.emit('colorChange', false);
    }

    handleActions(action) {
        switch (action.type) {
            case 'OPEN_SNACKBAR':
                this.snackbarVariant = action.variant;
                this.snackbarMessage = action.message;
                this.snackbarDuration = action.duration ? action.duration : this.snackbarDuration;
                this.snackbarPosition = action.position ? action.position : this.snackbarPosition;
                this.snackbarStyle = action.style ? action.style : this.snackbarStyle;
                this.emit('openSnackbar');
                break;
            case 'TOGGLE_THEME':
                this.theme = action.theme;
                this.emit('themeToggle');
                window.localStorage.setItem('theme', action.theme);
                break;
            default: //do nothing
        }
    }
}

const store = new AppStore();
dispatcher.register(store.handleActions.bind(store));
export default store;
