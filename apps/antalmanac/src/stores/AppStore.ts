import { EventEmitter } from 'events';
import { VariantType } from 'notistack';

import { ScheduleCourse, ScheduleSaveState, RepeatingCustomEvent } from '@packages/antalmanac-types';
import { Schedules } from './Schedules';
import { SnackbarPosition } from '$components/NotificationSnackbar';
import { CalendarEvent, CourseEvent } from '$components/Calendar/CourseCalendarEvent';
import { useTabStore } from '$stores/TabStore';
import { saveSchedule } from '$actions/AppStoreActions';

type ActionType = [
    null | string,
    null | number | string | RepeatingCustomEvent | ScheduleCourse,
    null | number | string | number[],
    null | number | string | RepeatingCustomEvent,
];

class AppStore extends EventEmitter {
    schedule: Schedules;
    customEvents: RepeatingCustomEvent[];
    colorPickers: Record<string, EventEmitter>;
    snackbarMessage: string;
    snackbarVariant: VariantType;
    snackbarDuration: number;
    snackbarPosition: SnackbarPosition;
    snackbarStyle: object; // not sure what this is. I don't think we ever use it
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

        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', (event) => {
                if (this.unsavedChanges) {
                    event.returnValue = `Are you sure you want to leave? You have unsaved changes!`;
                }
            });
        }
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
        this.autoSaveSchedule(['addCourse', newCourse, scheduleIndex, null]);
        this.emit('addedCoursesChange');
        return addedCourse;
    }

    getEventsInCalendar() {
        return this.schedule.getCalendarizedEvents();
    }

    getEventsWithFinalsInCalendar() {
        return [...this.schedule.getCalendarizedEvents(), ...this.schedule.getCalendarizedFinals()];
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
        this.autoSaveSchedule(['deleteCourse', sectionCode, term, null]);
        this.emit('addedCoursesChange');
    }

    deleteCourses(sectionCodes: string[], term: string) {
        sectionCodes.forEach((sectionCode) => this.deleteCourse(sectionCode, term));
        this.unsavedChanges = true;
        this.emit('addedCoursesChange');
    }

    undoAction() {
        this.schedule.revertState();
        this.unsavedChanges = true;
        this.autoSaveSchedule();
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
        this.autoSaveSchedule(['addCustomEvent', customEvent, scheduleIndices, null]);
        this.emit('customEventsChange');
    }

    editCustomEvent(editedCustomEvent: RepeatingCustomEvent, newScheduleIndices: number[]) {
        this.schedule.editCustomEvent(editedCustomEvent, newScheduleIndices);
        this.unsavedChanges = true;
        this.autoSaveSchedule(['editCustomEvent', editedCustomEvent, newScheduleIndices, null]);
        this.emit('customEventsChange');
    }

    deleteCustomEvent(customEventId: number) {
        this.schedule.deleteCustomEvent(customEventId);
        this.unsavedChanges = true;
        this.autoSaveSchedule(['deleteCustomEvent', customEventId, null, null]);
        this.emit('customEventsChange');
    }

    changeCustomEventColor(customEventId: number, newColor: string) {
        this.schedule.changeCustomEventColor(customEventId, newColor);
        this.unsavedChanges = true;
        this.autoSaveSchedule(['changeCustomEventColor', customEventId, newColor, null]);
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
        this.autoSaveSchedule(['copySchedule', to, null, null]);
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

        const unsavedActionsString = window.localStorage.getItem('unsavedActions');
        if (unsavedActionsString !== null && confirm('You have unsaved changes. Would you like to load them?')) {
            for (const action of JSON.parse(unsavedActionsString)) {
                switch (action[0]) {
                    case 'addCourse':
                        this.schedule.addCourse(action[1], action[2]);
                        break;
                    case 'deleteCourse':
                        this.schedule.deleteCourse(action[1], action[2]);
                        break;
                    case 'addCustomEvent':
                        this.schedule.addCustomEvent(action[1], action[2]);
                        break;
                    case 'deleteCustomEvent':
                        this.schedule.deleteCustomEvent(action[1]);
                        break;
                    case 'editCustomEvent':
                        this.schedule.editCustomEvent(action[1], action[2]);
                        break;
                    case 'changeCustomEventColor':
                        this.schedule.changeCustomEventColor(action[1], action[2]);
                        break;
                    case 'changeCourseColor':
                        this.schedule.changeCourseColor(action[1], action[2], action[3]);
                        break;
                    case 'clearSchedule':
                        this.schedule.clearCurrentSchedule();
                        break;
                    case 'copySchedule':
                        this.schedule.copySchedule(action[1]);
                        break;
                    default:
                        break;
                }
            }
            window.localStorage.removeItem('unsavedActions');
        }

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
        useTabStore.getState().setActiveTab(1);
    }

    changeCurrentSchedule(newScheduleIndex: number) {
        this.schedule.setCurrentScheduleIndex(newScheduleIndex);
        this.emit('currentScheduleIndexChange');
        this.emit('scheduleNotesChange');
    }

    clearSchedule() {
        this.schedule.clearCurrentSchedule();
        this.unsavedChanges = true;
        this.autoSaveSchedule(['clearSchedule', null, null, null]);
        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
    }

    deleteSchedule(scheduleIndex: number) {
        this.schedule.deleteSchedule(scheduleIndex);
        this.emit('scheduleNamesChange');
        this.emit('currentScheduleIndexChange');
        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
        this.emit('scheduleNotesChange');
    }

    changeCourseColor(sectionCode: string, term: string, newColor: string) {
        this.schedule.changeCourseColor(sectionCode, term, newColor);
        this.unsavedChanges = true;
        this.autoSaveSchedule(['changeCourseColor', sectionCode, term, newColor]);
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

    updateScheduleNote(newScheduleNote: string, scheduleIndex: number) {
        this.schedule.updateScheduleNote(newScheduleNote, scheduleIndex);
        this.emit('scheduleNotesChange');
    }

    termsInSchedule = (term: string) =>
        new Set([term, ...this.schedule.getCurrentCourses().map((course) => course.term)]);

    autoSaveSchedule = async (action: ActionType = [null, null, null, null]) => {
        const autoSave = typeof Storage !== 'undefined' && window.localStorage.getItem('autoSave') == 'true';
        if (autoSave) {
            const savedUserID = window.localStorage.getItem('userID');

            if (savedUserID) {
                this.emit('autoSaveStart');
                await saveSchedule(savedUserID, true, true);
                this.unsavedChanges = false;
                this.emit('autoSaveEnd');
            }
        } else {
            const unsavedActionsString = window.localStorage.getItem('unsavedActions');
            if (unsavedActionsString == null) {
                const unsavedActions = [action];
                localStorage.setItem('unsavedActions', JSON.stringify(unsavedActions));
            } else {
                const unsavedActions = JSON.parse(unsavedActionsString);
                unsavedActions.push(action);
                localStorage.setItem('unsavedActions', JSON.stringify(unsavedActions));
            }
        }
    };
}

const store = new AppStore();
export default store;
