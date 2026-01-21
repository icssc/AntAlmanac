import { EventEmitter } from 'events';

import type {
    ScheduleCourse,
    ScheduleSaveState,
    RepeatingCustomEvent,
    HydratedScheduleSaveState
    CustomEventId,
} from '@packages/antalmanac-types';
import { SnackbarOrigin, VariantType } from 'notistack';

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
    RenameScheduleAction,
    DeleteScheduleAction,
    ReorderScheduleAction,
    ChangeCourseColorAction,
    UndoRedoAction,
    AddScheduleAction,
} from '$actions/ActionTypesStore';
import type { CalendarEvent, CourseEvent } from '$components/Calendar/CourseCalendarEvent';
import { Schedules } from '$stores/Schedules';
import { useTabStore } from '$stores/TabStore';
import { deleteTempSaveData, loadTempSaveData, setTempSaveData } from '$stores/localTempSaveDataHelpers';

class AppStore extends EventEmitter {
    schedule: Schedules;

    customEvents: RepeatingCustomEvent[];

    colorPickers: Record<string, EventEmitter>;

    snackbarMessage: string;

    snackbarVariant: VariantType;

    snackbarDuration: number;

    snackbarPosition: SnackbarOrigin;

    snackbarStyle: object;

    eventsInCalendar: CalendarEvent[];

    finalsEventsInCalendar: CourseEvent[];

    unsavedChanges: boolean;

    skeletonMode: boolean;

    constructor() {
        super();
        this.setMaxListeners(300);
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

    getNextScheduleName(scheduleIndex: number, newScheduleName: string) {
        return this.schedule.getNextScheduleName(scheduleIndex, newScheduleName);
    }

    getDefaultScheduleName() {
        return this.schedule.getDefaultScheduleName();
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

    getCurrentSkeletonSchedule() {
        return this.schedule.getCurrentSkeletonSchedule();
    }

    getSkeletonScheduleNames() {
        return this.schedule.getSkeletonScheduleNames();
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

    deleteCourse(sectionCode: string, term: string, scheduleIndex: number, triggerUnsavedWarning = true) {
        this.schedule.deleteCourse(sectionCode, term, scheduleIndex);
        this.unsavedChanges = triggerUnsavedWarning;
        const action: DeleteCourseAction = {
            type: 'deleteCourse',
            sectionCode: sectionCode,
            term: term,
            scheduleIndex: this.schedule.getCurrentScheduleIndex(),
        };
        actionTypesStore.autoSaveSchedule(action);
        this.emit('addedCoursesChange');
    }

    deleteCourses(sectionCodes: string[], term: string, scheduleIndex: number, triggerUnsavedWarning = true) {
        sectionCodes.forEach((sectionCode) =>
            this.deleteCourse(sectionCode, term, scheduleIndex, triggerUnsavedWarning)
        );
        this.emit('addedCoursesChange');
    }

    private emitHistoryRelatedChanges() {
        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
        this.emit('colorChange', false);
        this.emit('scheduleNamesChange');
        this.emit('currentScheduleIndexChange');
        this.emit('scheduleNotesChange');
    }

    undoAction() {
        const reverted = this.schedule.revertState();
        if (!reverted) {
            return;
        }
        this.unsavedChanges = true;
        const action: UndoRedoAction = {
            type: 'undoRedoAction',
            direction: 'undo',
        };
        actionTypesStore.autoSaveSchedule(action);
        this.emitHistoryRelatedChanges();
    }

    redoAction() {
        const advanced = this.schedule.advanceState();
        if (!advanced) {
            return;
        }
        this.unsavedChanges = true;
        const action: UndoRedoAction = {
            type: 'undoRedoAction',
            direction: 'redo',
        };
        actionTypesStore.autoSaveSchedule(action);
        this.emitHistoryRelatedChanges();
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

    deleteCustomEvent(customEventId: CustomEventId, scheduleIndices: number[]) {
        this.schedule.deleteCustomEvent(customEventId, scheduleIndices);
        this.unsavedChanges = true;
        const action: DeleteCustomEventAction = {
            type: 'deleteCustomEvent',
            customEventId: customEventId,
            scheduleIndices: scheduleIndices,
        };
        actionTypesStore.autoSaveSchedule(action);
        this.emit('customEventsChange');
    }

    changeCustomEventColor(customEventId: CustomEventId, newColor: string) {
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
        this.unsavedChanges = true;
        const action: AddScheduleAction = {
            type: 'addSchedule',
            newScheduleName: newScheduleName,
        };
        actionTypesStore.autoSaveSchedule(action);
        this.emit('scheduleNamesChange');
        this.emit('currentScheduleIndexChange');
        this.emit('scheduleNotesChange');
    }

    renameSchedule(scheduleIndex: number, newScheduleName: string) {
        this.schedule.renameSchedule(scheduleIndex, newScheduleName);
        this.unsavedChanges = true;
        const action: RenameScheduleAction = {
            type: 'renameSchedule',
            scheduleIndex: scheduleIndex,
            newScheduleName: newScheduleName,
        };
        actionTypesStore.autoSaveSchedule(action);
        this.emit('scheduleNamesChange');
    }

    saveSchedule() {
        this.unsavedChanges = false;
        window.localStorage.removeItem('unsavedActions');
    }

    copySchedule(scheduleIndex: number, newScheduleName: string) {
        this.schedule.copySchedule(scheduleIndex, newScheduleName);
        this.unsavedChanges = true;
        const action: CopyScheduleAction = {
            type: 'copySchedule',
            scheduleIndex: scheduleIndex,
            newScheduleName: newScheduleName,
        };
        actionTypesStore.autoSaveSchedule(action);
        this.emit('scheduleNamesChange');
        this.emit('currentScheduleIndexChange');
        this.emit('scheduleNotesChange');
        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
    }

    reorderSchedule(from: number, to: number) {
        this.schedule.reorderSchedule(from, to);
        this.unsavedChanges = true;
        const action: ReorderScheduleAction = {
            type: 'reorderSchedule',
            from: from,
            to: to,
        };
        actionTypesStore.autoSaveSchedule(action);
        this.emit('currentScheduleIndexChange');
        this.emit('scheduleNamesChange', { triggeredBy: 'reorder' });
        this.emit('reorderSchedule');
    }

    private isHydratedSaveState(
        savedSchedule: HydratedScheduleSaveState | ScheduleSaveState
    ): savedSchedule is HydratedScheduleSaveState {
        return savedSchedule.schedules.some((schedule) =>
            schedule.courses.some((course) => 'section' in course)
        );
    }

    private toShortSaveState(savedSchedule: HydratedScheduleSaveState | ScheduleSaveState): ScheduleSaveState {
        if (!this.isHydratedSaveState(savedSchedule)) {
            return savedSchedule;
        }

        return {
            scheduleIndex: savedSchedule.scheduleIndex,
            schedules: savedSchedule.schedules.map((schedule) => ({
                scheduleName: schedule.scheduleName,
                customEvents: schedule.customEvents,
                scheduleNote: schedule.scheduleNote,
                courses: schedule.courses.map((course) => ({
                    sectionCode: course.section.sectionCode,
                    term: course.term,
                    color: course.section.color,
                })),
            })),
        };
    }

    private async loadScheduleFromSaveState(savedSchedule: HydratedScheduleSaveState | ScheduleSaveState) {
        try {
            await this.schedule.fromScheduleSaveState(savedSchedule);
            return true;
        } catch {
            return false;
        }
    }

    async loadSchedule(savedSchedule: HydratedScheduleSaveState | ScheduleSaveState) {
        const shortSaveState = this.toShortSaveState(savedSchedule);
        const hasDataChanged =
            JSON.stringify(this.schedule.getScheduleAsSaveState()) === JSON.stringify(shortSaveState);
        const loadSuccess = await this.loadScheduleFromSaveState(savedSchedule);
        if (!loadSuccess) {
            return false;
        }
        this.unsavedChanges = false;

        /**
         * Attempt to load unsaved actions
         * On failure, quietly reload from save state (essentially undoing any partially loaded unsaved actions)
         */
        try {
            await actionTypesStore.loadScheduleFromUnsavedActions();
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.error('Unsaved actions could not be loaded:', e.message);
            }
            await this.loadScheduleFromSaveState(savedSchedule);
        }

        this.schedule.clearPreviousStates();

        if (hasDataChanged) {
            deleteTempSaveData();
        } else {
            loadTempSaveData(shortSaveState.schedules.length);
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

        // Switch to added courses tab since Anteater API can't be reached anyway
        useTabStore.getState().setActiveTab('added');
    }

    changeCurrentSchedule(newScheduleIndex: number) {
        this.schedule.setCurrentScheduleIndex(newScheduleIndex);
        setTempSaveData({ currentScheduleIndex: newScheduleIndex });
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
        this.unsavedChanges = true;
        const action: DeleteScheduleAction = {
            type: 'deleteSchedule',
            scheduleIndex: scheduleIndex,
        };
        actionTypesStore.autoSaveSchedule(action);
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
        position?: SnackbarOrigin,
        style?: Record<string, string>
    ) {
        this.snackbarVariant = variant;
        this.snackbarMessage = message;
        this.snackbarDuration = duration != null ? duration * 1000 : 3000;
        this.snackbarPosition = position ? position : this.snackbarPosition;
        this.snackbarStyle = style ? style : this.snackbarStyle;
        this.emit('openSnackbar');
    }

    updateScheduleNote(newScheduleNote: string, scheduleIndex: number) {
        this.schedule.updateScheduleNote(newScheduleNote, scheduleIndex);
        this.emit('scheduleNotesChange');
    }

    termsInSchedule = (term: string) =>
        new Set([term, ...this.schedule.getCurrentCourses().map((course) => course.term)]);

    getPreviousStates = () => this.schedule.getPreviousStates();
}

const store = new AppStore();

export default store;
