import { EventEmitter } from 'events';
import { VariantType } from 'notistack';

import { ScheduleCourse, ScheduleSaveState } from '@packages/antalmanac-types';
import { Schedules } from './Schedules';
import { SnackbarPosition } from '$components/AppBar/NotificationSnackbar';
import { CalendarEvent, CourseEvent } from '$components/Calendar/CourseCalendarEvent';
import { RepeatingCustomEvent } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import RightPaneStore from '$components/RightPane/RightPaneStore';

function getCurrentTheme() {
    const theme = typeof Storage === 'undefined' ? 'auto' : window.localStorage.getItem('theme');
    return theme === null ? 'auto' : theme;
}

class AppStore extends EventEmitter {
    schedule: Schedules;
    customEvents: RepeatingCustomEvent[];
    colorPickers: Record<string, EventEmitter>;
    snackbarMessage: string;
    snackbarVariant: VariantType;
    snackbarDuration: number;
    snackbarPosition: SnackbarPosition;
    snackbarStyle: object; // not sure what this is. I don't think we ever use it
    theme: string;
    eventsInCalendar: CalendarEvent[];
    finalsEventsInCalendar: CourseEvent[];
    unsavedChanges: boolean;
    skeletonMode: boolean;

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
        this.skeletonMode = false;
        this.theme = getCurrentTheme();

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

    getSkeletonSchedule() {
        return this.schedule.getSkeletonSchedule();
    }

    addCourse(newCourse: ScheduleCourse, scheduleIndex: number = this.schedule.getCurrentScheduleIndex()) {
        let addedCourse: ScheduleCourse;
        if (scheduleIndex === this.schedule.getNumberOfSchedules()) {
            addedCourse = this.schedule.addCourseToAllSchedules(newCourse);
        } else {
            addedCourse = this.schedule.addCourse(newCourse, scheduleIndex);
        }
        this.unsavedChanges = true;
        this.emit('addedCoursesChange');
        return addedCourse;
    }

    getEventsInCalendar() {
        return this.schedule.getCalendarizedEvents();
    }

    getCourseEventsInCalendar() {
        return this.schedule.getCalendarizedCourseEvents();
    }

    getFinalEventsInCalendar() {
        return this.schedule.getCalendarizedFinals();
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

    getCurrentScheduleNote() {
        return this.schedule.getCurrentScheduleNote();
    }

    getSkeletonMode() {
        return this.skeletonMode;
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
        this.emit('scheduleNotesChange');
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
        this.emit('scheduleNotesChange');
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
        this.emit('scheduleNotesChange');

        return true;
    }

    loadSkeletonSchedule(savedSchedule: ScheduleSaveState) {
        this.schedule.setSkeletonSchedules(savedSchedule.schedules);
        this.skeletonMode = true;

        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
        this.emit('scheduleNamesChange');
        this.emit('currentScheduleIndexChange');
        this.emit('scheduleNotesChange');

        this.emit('skeletonModeChange');

        // Switch to added courses tab since PeterPortal can't be reached anyway
        RightPaneStore.handleTabChange(null, 1);
    }

    changeCurrentSchedule(newScheduleIndex: number) {
        this.schedule.setCurrentScheduleIndex(newScheduleIndex);
        this.emit('currentScheduleIndexChange');
        this.emit('scheduleNotesChange');
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
        this.emit('scheduleNotesChange');
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
        style?: Record<string, string>
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
        this.schedule.updateScheduleNote(newScheduleNote, scheduleIndex);
        this.emit('scheduleNotesChange');
    }
}

const store = new AppStore();
export default store;
