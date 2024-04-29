import { EventEmitter } from 'events';

import { ScheduleCourse, ScheduleSaveState, RepeatingCustomEvent } from '@packages/antalmanac-types';
import { VariantType } from 'notistack';

import { Schedules } from './Schedules';

import actionTypesStore from '$actions/ActionTypesStore';
import type {
    AddCourseAction,
    DeleteCourseAction,
    AddCustomEventAction,
    DeleteCustomEventAction,
    EditCustomEventAction,
    ChangeCustomEventColorAction,
    ClearScheduleAction,
    CopyScheduleAction,
    ChangeCourseColorAction,
    UndoAction,
} from '$actions/ActionTypesStore';
import { CalendarEvent, CourseEvent } from '$components/Calendar/CourseCalendarEvent';
import { SnackbarPosition } from '$components/NotificationSnackbar';
import { useTabStore } from '$stores/TabStore';

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
        const action: AddCourseAction = {
            type: 'addCourse',
            course: newCourse,
            scheduleIndex: scheduleIndex,
        };
        actionTypesStore.autoSaveSchedule(action);
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

    getCustomEventsInCalendar() {
        return this.schedule.getCalendarizedCustomEvents();
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

    deleteCourse(sectionCode: string, term: string, triggerUnsavedWarning = true) {
        this.schedule.deleteCourse(sectionCode, term);
        this.unsavedChanges = triggerUnsavedWarning;
        const action: DeleteCourseAction = {
            type: 'deleteCourse',
            sectionCode: sectionCode,
            term: term,
        };
        actionTypesStore.autoSaveSchedule(action);
        this.emit('addedCoursesChange');
    }

    deleteCourses(sectionCodes: string[], term: string, triggerUnsavedWarning = true) {
        sectionCodes.forEach((sectionCode) => this.deleteCourse(sectionCode, term, triggerUnsavedWarning));
        this.emit('addedCoursesChange');
    }

    undoAction() {
        this.schedule.revertState();
        this.unsavedChanges = true;
        const action: UndoAction = {
            type: 'undoAction',
        };
        actionTypesStore.autoSaveSchedule(action);
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
        const action: AddCustomEventAction = {
            type: 'addCustomEvent',
            customEvent: customEvent,
            scheduleIndices: scheduleIndices,
        };
        actionTypesStore.autoSaveSchedule(action);
        this.emit('customEventsChange');
    }

    editCustomEvent(editedCustomEvent: RepeatingCustomEvent, newScheduleIndices: number[]) {
        this.schedule.editCustomEvent(editedCustomEvent, newScheduleIndices);
        this.unsavedChanges = true;
        const action: EditCustomEventAction = {
            type: 'editCustomEvent',
            editedCustomEvent: editedCustomEvent,
            newScheduleIndices: newScheduleIndices,
        };
        actionTypesStore.autoSaveSchedule(action);
        this.emit('customEventsChange');
    }

    deleteCustomEvent(customEventId: number) {
        this.schedule.deleteCustomEvent(customEventId);
        this.unsavedChanges = true;
        const action: DeleteCustomEventAction = {
            type: 'deleteCustomEvent',
            customEventId: customEventId,
        };
        actionTypesStore.autoSaveSchedule(action);
        this.emit('customEventsChange');
    }

    changeCustomEventColor(customEventId: number, newColor: string) {
        this.schedule.changeCustomEventColor(customEventId, newColor);
        this.unsavedChanges = true;
        const action: ChangeCustomEventColorAction = {
            type: 'changeCustomEventColor',
            customEventId: customEventId,
            newColor: newColor,
        };
        actionTypesStore.autoSaveSchedule(action);
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
        window.localStorage.removeItem('unsavedActions');
    }

    copySchedule(to: number) {
        this.schedule.copySchedule(to);
        this.unsavedChanges = true;
        const action: CopyScheduleAction = {
            type: 'copySchedule',
            to: to,
        };
        actionTypesStore.autoSaveSchedule(action);
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

        await actionTypesStore.loadScheduleFromLocalSave();

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
        const action: ClearScheduleAction = {
            type: 'clearSchedule',
        };
        actionTypesStore.autoSaveSchedule(action);
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
        const action: ChangeCourseColorAction = {
            type: 'changeCourseColor',
            sectionCode: sectionCode,
            term: term,
            newColor: newColor,
        };
        actionTypesStore.autoSaveSchedule(action);
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
}

const store = new AppStore();
export default store;
