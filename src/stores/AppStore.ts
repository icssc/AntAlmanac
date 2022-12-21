import { EventEmitter } from 'events';
import { VariantType } from 'notistack';
import { SnackbarPosition } from '../components/AppBar/NotificationSnackbar';
import { CalendarEvent, CourseEvent } from '../components/Calendar/CourseCalendarEvent';
import { RepeatingCustomEvent } from '../components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import { AASection } from '../peterportal.types';
import { calendarizeCourseEvents, calendarizeCustomEvents, calendarizeFinals } from './calenderizeHelpers';
import {Schedules} from "./Schedules";

export interface UserData {
    addedCourses: AppStoreCourse[]
    scheduleNames: string[]
    customEvents: RepeatingCustomEvent[]
}

export interface AppStoreCourse {
    color: string
    courseComment: string
    courseNumber: string //i.e. 122a
    courseTitle: string
    deptCode: string
    prerequisiteLink: string
    section: AASection
    // sectionCode: string
    term: string
}

export interface AppStoreDeletedCourse extends AppStoreCourse {
    scheduleIndex: number
}

class AppStore extends EventEmitter {
    schedule: Schedules
    customEvents: RepeatingCustomEvent[]
    colorPickers: {[key:string]: EventEmitter}
    deletedCourses: AppStoreDeletedCourse[]
    snackbarMessage: string
    snackbarVariant: VariantType
    snackbarDuration: number
    snackbarPosition: SnackbarPosition
    snackbarStyle: object // not sure what this is. I don't think we ever use it
    theme: string
    eventsInCalendar: CalendarEvent[]
    finalsEventsInCalendar: CourseEvent[]
    unsavedChanges: boolean

    constructor() {
        super();
        this.setMaxListeners(300); //this number is big because every section on the search results page listens to two events each.
        this.customEvents = [];
        this.schedule = new Schedules()
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
        return this.schedule.getCurrentScheduleIndex()
    }

    getScheduleNames() {
        return this.schedule.getScheduleNames()
    }

    getAddedCourses() {
        return this.schedule.getAllCourses()
    }

    addCourse(newCourse: AppStoreCourse, addToAllSchedules: boolean = false) {
        if (addToAllSchedules){
            this.schedule.addCourseToAllSchedules(newCourse)
        }
        else{
            this.schedule.addCourse(newCourse)
        }
        this.finalsEventsInCalendar = calendarizeFinals();
        this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
        this.unsavedChanges = true;
        this.emit('addedCoursesChange');
    }


    getCustomEvents() {
        // TODO
        // Note: remove this forEach loop after Spring 2022 ends
        // this.customEvents.forEach((customEvent) => {
        //     if (customEvent.days.length === 5) {
        //         customEvent.days = [false, ...customEvent.days, false];
        //     } else if (customEvent.days.length === 6) {
        //         customEvent.days = [...customEvent.days, false];
        //     }
        // });
        //
        // return this.customEvents;
        return this.customEvents
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
        return this.schedule.getAddedSectionCodes();
    }

    hasUnsavedChanges() {
        return this.unsavedChanges;
    }

    registerColorPicker(id: string, update: (color: string)=>void) {
        if (id in this.colorPickers) {
            this.colorPickers[id].on('colorChange', update);
        } else {
            this.colorPickers[id] = new EventEmitter();
            this.colorPickers[id].on('colorChange', update);
        }
    }


    unregisterColorPicker(id: string, update: (color: string)=>void) {
        if (id in this.colorPickers) {
            this.colorPickers[id].removeListener('colorChange', update);
            if (this.colorPickers[id].listenerCount('colorChange') === 0) {
                delete this.colorPickers[id];
            }
        }
    }

    deleteCourse(sectionCode: string, term: string) {
        this.schedule.deleteCourse(sectionCode, term)
        this.finalsEventsInCalendar = calendarizeFinals();
        this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
        this.unsavedChanges = true;
        this.emit('addedCoursesChange');
    }

    undoDelete(deletedCourses: AppStoreDeletedCourse[]) {
        // TODO
        // this.deletedCourses = deletedCourses;
        // this.unsavedChanges = true;
    }

    addCustomEvent(customEvent: RepeatingCustomEvent) {
        throw new Error('Not Implemented')
        // this.customEvents = this.customEvents.concat(customEvent);
        // this.finalsEventsInCalendar = calendarizeFinals();
        // this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
        // this.unsavedChanges = true;
        // this.emit('customEventsChange');
    }

    editCustomEvent(customEventsAfterEdit: RepeatingCustomEvent[]) {
        throw new Error('Not Implemented')
        // this.customEvents = customEventsAfterEdit;
        // this.finalsEventsInCalendar = calendarizeFinals();
        // this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
        // this.unsavedChanges = true;
        // this.emit('customEventsChange');
    }

    deleteCustomEvent(customEventsAfterDelete: RepeatingCustomEvent[]) {
        throw new Error('Not Implemented')
        // this.customEvents = customEventsAfterDelete;
        // this.finalsEventsInCalendar = calendarizeFinals();
        // this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
        // this.unsavedChanges = true;
        // this.emit('customEventsChange');
    }

    changeCustomEventColor(customEventsAfterColorChange: RepeatingCustomEvent[], customEventID: number, newColor: string) {
        throw new Error('Not Implemented')
        // this.customEvents = customEventsAfterColorChange;
        // this.finalsEventsInCalendar = calendarizeFinals();
        // this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
        // this.unsavedChanges = true;
        // this.colorPickers[customEventID].emit('colorChange', newColor);
        // this.emit('colorChange', false);
    }

    addSchedule(newScheduleName: string) {
        // If the user adds a schedule, update the array of schedule names, add
        // another key/value pair to keep track of the section codes for that schedule,
        // and redirect the user to the new schedule
        this.schedule.addSchedule((newScheduleName))
        this.emit('scheduleNamesChange');
        this.emit('currentScheduleIndexChange');
    }

    renameSchedule(scheduleName: string, scheduleIndex: number) {
        this.schedule.renameSchedule(scheduleName, scheduleIndex)
        this.emit('scheduleNamesChange');
    }

    saveSchedule() {
        this.unsavedChanges = false;
    }

    copySchedule(addedCoursesAfterCopy: AppStoreCourse[], customEventsAfterCopy: RepeatingCustomEvent[]) {
        throw new Error('Not Implemented')
        // this.addedCourses = addedCoursesAfterCopy;
        // this.updateAddedSectionCodes();
        // this.customEvents = customEventsAfterCopy;
        // this.finalsEventsInCalendar = calendarizeFinals();
        // this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
        // this.unsavedChanges = true;
        // this.emit('addedCoursesChange');
        // this.emit('customEventsChange');
    }

    loadSchedule(userData: UserData) {
        throw new Error('Not Implemented')
        // this.addedCourses = userData.addedCourses;
        // this.scheduleNames = userData.scheduleNames;
        // this.updateAddedSectionCodes();
        // this.customEvents = userData.customEvents;
        // this.finalsEventsInCalendar = calendarizeFinals();
        // this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
        // this.unsavedChanges = false;
        // this.emit('addedCoursesChange');
        // this.emit('customEventsChange');
        // this.emit('scheduleNamesChange');
    }

    changeCurrentSchedule(newScheduleIndex: number) {
        this.schedule.setCurrentScheduleIndex(newScheduleIndex)
        this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
        this.emit('currentScheduleIndexChange');
    }

    clearSchedule(addedCoursesAfterClear: AppStoreCourse[], customEventsAfterClear: RepeatingCustomEvent[]) {
        throw new Error('Not Implemented')
        // this.addedCourses = addedCoursesAfterClear;
        // this.updateAddedSectionCodes();
        // this.customEvents = customEventsAfterClear;
        // this.finalsEventsInCalendar = calendarizeFinals();
        // this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
        // this.unsavedChanges = true;
        // this.emit('addedCoursesChange');
        // this.emit('customEventsChange');
    }

    deleteSchedule() {
        this.schedule.deleteCurrentSchedule();
        this.finalsEventsInCalendar = calendarizeFinals();
        this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
        this.emit('scheduleNamesChange');
        this.emit('currentScheduleIndexChange');
        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
    }

    changeCourseColor(addedCoursesAfterColorChange: AppStoreCourse[], sectionCode: string, newColor: string) {
        throw new Error('Not Implemented')
        // this.addedCourses = addedCoursesAfterColorChange;
        // this.updateAddedSectionCodes();
        // this.finalsEventsInCalendar = calendarizeFinals();
        // this.eventsInCalendar = [...calendarizeCourseEvents(), ...calendarizeCustomEvents()];
        // this.unsavedChanges = true;
        // this.colorPickers[sectionCode].emit('colorChange', newColor);
        // this.emit('colorChange', false);
    }

    openSnackbar(variant: VariantType, message: string, duration?: number, position?: SnackbarPosition, style?: {[cssPropertyName: string]: string}) {
        this.snackbarVariant = variant;
        this.snackbarMessage = message;
        this.snackbarDuration = duration ? duration : this.snackbarDuration;
        this.snackbarPosition = position ? position : this.snackbarPosition;
        this.snackbarStyle = style ? style : this.snackbarStyle;
        this.emit('openSnackbar'); // sends event to NotificationSnackbar
    }

    toggleTheme(theme: string) {
        this.theme = theme;
        this.emit('themeToggle');
        window.localStorage.setItem('theme', theme);
    }
}

const store = new AppStore();
export default store;
