import { EventEmitter } from 'events';
import { VariantType } from 'notistack';

import { ScheduleCourse, ScheduleSaveState } from './schedule.types';
import { Schedules } from './Schedules';
import { SnackbarPosition } from '$components/AppBar/NotificationSnackbar';
import { CalendarEvent, CourseEvent } from '$components/Calendar/CourseCalendarEvent';
import { RepeatingCustomEvent } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import RightPaneStore from "$components/RightPane/RightPaneStore";

class AppStore extends EventEmitter {
    schedules: Schedules;
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
    barebonesMode: boolean;

    constructor() {
        super();
        this.setMaxListeners(300); //this number is big because every section on the search results page listens to two events each.
        this.customEvents = [];
        this.schedules = new Schedules();
        this.colorPickers = {};
        this.snackbarMessage = '';
        this.snackbarVariant = 'info';
        this.snackbarDuration = 3000;
        this.snackbarPosition = { vertical: 'bottom', horizontal: 'left' };
        this.snackbarStyle = {};
        this.eventsInCalendar = [];
        this.finalsEventsInCalendar = [];
        this.unsavedChanges = false;
        this.barebonesMode = false;
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
        return this.schedules.getCurrentScheduleIndex();
    }

    getScheduleNames() {
        return this.schedules.getScheduleNames();
    }

    getAddedCourses() {
        return this.schedules.getAllCourses();
    }

    getCustomEvents() {
        return this.schedules.getAllCustomEvents();
    }

    getBarebonesSchedule() {
        return this.schedules.getBarebonesSchedule();
    }

    addCourse(newCourse: ScheduleCourse, scheduleIndex: number = this.schedules.getCurrentScheduleIndex()) {
        let addedCourse: ScheduleCourse;
        if (scheduleIndex === this.schedules.getNumberOfSchedules()) {
            addedCourse = this.schedules.addCourseToAllSchedules(newCourse);
        } else {
            addedCourse = this.schedules.addCourse(newCourse);
        }
        this.unsavedChanges = true;
        this.emit('addedCoursesChange');
        return addedCourse;
    }

    getEventsInCalendar() {
        return this.schedules.toCalendarizedEvents();
    }

    getFinalEventsInCalendar() {
        return this.schedules.toCalendarizedFinals();
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
        return this.schedules.getAddedSectionCodes();
    }

    getCurrentScheduleNote() {
        return this.schedules.getCurrentScheduleNote();
    }

    getBarebonesMode() {
        return this.barebonesMode;
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
        this.schedules.deleteCourse(sectionCode, term);
        this.unsavedChanges = true;
        this.emit('addedCoursesChange');
    }

    undoAction() {
        this.schedules.revertState();
        this.unsavedChanges = true;
        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
        this.emit('colorChange', false);
        this.emit('scheduleNamesChange');
        this.emit('currentScheduleIndexChange');
        this.emit('scheduleNotesChange');
    }

    addCustomEvent(customEvent: RepeatingCustomEvent, scheduleIndices: number[]) {
        this.schedules.addCustomEvent(customEvent, scheduleIndices);
        this.unsavedChanges = true;
        this.emit('customEventsChange');
    }

    editCustomEvent(editedCustomEvent: RepeatingCustomEvent, newScheduleIndices: number[]) {
        this.schedules.editCustomEvent(editedCustomEvent, newScheduleIndices);
        this.unsavedChanges = true;
        this.emit('customEventsChange');
    }

    deleteCustomEvent(customEventId: number) {
        this.schedules.deleteCustomEvent(customEventId);
        this.unsavedChanges = true;
        this.emit('customEventsChange');
    }

    changeCustomEventColor(customEventId: number, newColor: string) {
        this.schedules.changeCustomEventColor(customEventId, newColor);
        this.unsavedChanges = true;
        this.colorPickers[customEventId].emit('colorChange', newColor);
        this.emit('colorChange', false);
    }

    addSchedule(newScheduleName: string) {
        // If the user adds a schedule, update the array of schedule names, add
        // another key/value pair to keep track of the section codes for that schedule,
        // and redirect the user to the new schedule
        this.schedules.addNewSchedule(newScheduleName);
        this.emit('scheduleNamesChange');
        this.emit('currentScheduleIndexChange');
        this.emit('scheduleNotesChange');
    }

    renameSchedule(scheduleName: string, scheduleIndex: number) {
        this.schedules.renameSchedule(scheduleName, scheduleIndex);
        this.emit('scheduleNamesChange');
    }

    saveSchedule() {
        this.unsavedChanges = false;
    }

    copySchedule(to: number) {
        this.schedules.copySchedule(to);
        this.unsavedChanges = true;
        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
    }

    async loadSchedule(savedSchedule: ScheduleSaveState) {
        try {
            // This will not throw if the saved schedule is valid but PeterPortal can't be reached
            // It will call loadBarebonesSchedule and return normally
            await this.schedules.fromScheduleSaveState(savedSchedule);
        } catch {
            return false;
        }
        this.unsavedChanges = false;
        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
        this.emit('scheduleNamesChange');
        this.emit('currentScheduleIndexChange');
        this.emit('scheduleNotesChange');

        return true;
    }

    loadBarebonesSchedule(savedSchedule: ScheduleSaveState) {
        this.schedules.setBarebonesSchedules(savedSchedule.schedules);
        this.barebonesMode = true;

        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
        this.emit('scheduleNamesChange');
        this.emit('currentScheduleIndexChange');
        this.emit('scheduleNotesChange');

        this.emit('barebonesModeChange');

        // Switch to added courses tab since PeterPortal can't be reached anyway
        RightPaneStore.handleTabChange(null, 1);
    }

    changeCurrentSchedule(newScheduleIndex: number) {
        this.schedules.setCurrentScheduleIndex(newScheduleIndex);
        this.emit('currentScheduleIndexChange');
        this.emit('scheduleNotesChange');
    }

    clearSchedule() {
        this.schedules.clearCurrentSchedule();
        this.unsavedChanges = true;
        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
    }

    deleteSchedule() {
        this.schedules.deleteCurrentSchedule();
        this.emit('scheduleNamesChange');
        this.emit('currentScheduleIndexChange');
        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
        this.emit('scheduleNotesChange');
    }

    changeCourseColor(sectionCode: string, term: string, newColor: string) {
        this.schedules.changeCourseColor(sectionCode, term, newColor);
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

    updateScheduleNote(newScheduleNote: string, scheduleIndex: number) {
        this.schedules.updateScheduleNote(newScheduleNote, scheduleIndex);
        this.emit('scheduleNotesChange');
    }
}

const store = new AppStore();
export default store;
