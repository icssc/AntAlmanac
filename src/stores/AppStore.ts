import { EventEmitter } from 'events';
import { VariantType } from 'notistack';

import { ScheduleCourse, ScheduleSaveState } from './schedule.types';
import { Schedules } from './Schedules';
import { SnackbarPosition } from '$components/AppBar/NotificationSnackbar';
import { CalendarEvent, CourseEvent } from '$components/Calendar/CourseCalendarEvent';
import { RepeatingCustomEvent } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';

class AppStore extends EventEmitter {
    schedule: Schedules;
    customEvents: RepeatingCustomEvent[];
    colorPickers: { [key: string]: EventEmitter };
    snackbarMessage: string;
    snackbarVariant: VariantType;
    snackbarDuration: number;
    snackbarPosition: SnackbarPosition;
    snackbarStyle: object; // not sure what this is. I don't think we ever use it
    theme: string;
    eventsInCalendar: CalendarEvent[];
    finalsEventsInCalendar: CourseEvent[];
    unsavedChanges: boolean;

    constructor() {
        super();
        this.setMaxListeners(300); //this number is big because every section on the search results page listens to two events each.
        this.customEvents = [];
        this.schedule = new Schedules();
        this.colorPickers = {};
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
        return this.schedule.getCurrentScheduleIndex();
    }

    getScheduleNames() {
        return this.schedule.getScheduleNames();
    }

    getAddedCourses() {
        return this.schedule.getAllCourses();
    }

    getCustomEvents() {
        return this.schedule.getAllCustomEvents();
    }

    addCourse(newCourse: ScheduleCourse, scheduleIndex: number = this.schedule.getCurrentScheduleIndex()) {
        let addedCourse: ScheduleCourse;
        if (scheduleIndex === this.schedule.getNumberOfSchedules()) {
            addedCourse = this.schedule.addCourseToAllSchedules(newCourse);
        } else {
            addedCourse = this.schedule.addCourse(newCourse);
        }
        this.unsavedChanges = true;
        this.emit('addedCoursesChange');
        return addedCourse;
    }

    getEventsInCalendar() {
        return this.schedule.toCalendarizedEvents();
    }

    getFinalEventsInCalendar() {
        return this.schedule.toCalendarizedFinals();
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

    registerColorPicker(id: string, update: (color: string) => void) {
        if (id in this.colorPickers) {
            this.colorPickers[id].on('colorChange', update);
        } else {
            this.colorPickers[id] = new EventEmitter();
            this.colorPickers[id].on('colorChange', update);
        }
    }

    unregisterColorPicker(id: string, update: (color: string) => void) {
        if (id in this.colorPickers) {
            this.colorPickers[id].removeListener('colorChange', update);
            if (this.colorPickers[id].listenerCount('colorChange') === 0) {
                delete this.colorPickers[id];
            }
        }
    }

    deleteCourse(sectionCode: string, term: string) {
        this.schedule.deleteCourse(sectionCode, term);
        this.unsavedChanges = true;
        this.emit('addedCoursesChange');
    }

    undoAction() {
        this.schedule.revertState();
        this.unsavedChanges = true;
        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
        this.emit('colorChange', false);
        this.emit('scheduleNamesChange');
        this.emit('currentScheduleIndexChange');
    }

    addCustomEvent(customEvent: RepeatingCustomEvent, scheduleIndices: number[]) {
        this.schedule.addCustomEvent(customEvent, scheduleIndices);
        this.unsavedChanges = true;
        this.emit('customEventsChange');
    }

    editCustomEvent(editedCustomEvent: RepeatingCustomEvent, newScheduleIndices: number[]) {
        this.schedule.editCustomEvent(editedCustomEvent, newScheduleIndices);
        this.unsavedChanges = true;
        this.emit('customEventsChange');
    }

    deleteCustomEvent(customEventId: number) {
        this.schedule.deleteCustomEvent(customEventId);
        this.unsavedChanges = true;
        this.emit('customEventsChange');
    }

    changeCustomEventColor(customEventId: number, newColor: string) {
        this.schedule.changeCustomEventColor(customEventId, newColor);
        this.unsavedChanges = true;
        this.colorPickers[customEventId].emit('colorChange', newColor);
        this.emit('colorChange', false);
    }

    addSchedule(newScheduleName: string) {
        // If the user adds a schedule, update the array of schedule names, add
        // another key/value pair to keep track of the section codes for that schedule,
        // and redirect the user to the new schedule
        this.schedule.addNewSchedule(newScheduleName);
        this.emit('scheduleNamesChange');
        this.emit('currentScheduleIndexChange');
    }

    renameSchedule(scheduleName: string, scheduleIndex: number) {
        this.schedule.renameSchedule(scheduleName, scheduleIndex);
        this.emit('scheduleNamesChange');
    }

    saveSchedule() {
        this.unsavedChanges = false;
    }

    copySchedule(to: number) {
        this.schedule.copySchedule(to);
        this.unsavedChanges = true;
        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
    }

    async loadSchedule(savedSchedule: ScheduleSaveState) {
        try {
            await this.schedule.fromScheduleSaveState(savedSchedule);
        } catch {
            return false;
        }
        this.unsavedChanges = false;
        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
        this.emit('scheduleNamesChange');
        this.emit('currentScheduleIndexChange');
        return true;
    }

    changeCurrentSchedule(newScheduleIndex: number) {
        this.schedule.setCurrentScheduleIndex(newScheduleIndex);
        this.emit('currentScheduleIndexChange');
    }

    clearSchedule() {
        this.schedule.clearCurrentSchedule();
        this.unsavedChanges = true;
        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
    }

    deleteSchedule() {
        this.schedule.deleteCurrentSchedule();
        this.emit('scheduleNamesChange');
        this.emit('currentScheduleIndexChange');
        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
    }

    changeCourseColor(sectionCode: string, term: string, newColor: string) {
        this.schedule.changeCourseColor(sectionCode, term, newColor);
        this.unsavedChanges = true;
        this.colorPickers[sectionCode].emit('colorChange', newColor);
        this.emit('colorChange', false);
    }

    openSnackbar(
        variant: VariantType,
        message: string,
        duration?: number,
        position?: SnackbarPosition,
        style?: { [cssPropertyName: string]: string }
    ) {
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
