import { EventEmitter } from 'events';

import actionTypesStore, {
    type AddCourseAction,
    type DeleteCourseAction,
    type AddCustomEventAction,
    type DeleteCustomEventAction,
    type EditCustomEventAction,
    type ChangeCustomEventColorAction,
    type ClearScheduleAction,
    type CopyScheduleAction,
    type RenameScheduleAction,
    type DeleteScheduleAction,
    type ReorderScheduleAction,
    type ChangeCourseColorAction,
    type UndoRedoAction,
    type AddScheduleAction,
    type ReorderAddedCoursesAction,
} from '$actions/ActionTypesStore';
import type { CalendarEvent, CourseEvent } from '$components/Calendar/types';
import { courseColorKey } from '$lib/sectionThemes';
import { useFallbackStore } from '$stores/FallbackStore';
import { useHiddenCoursesStore } from '$stores/HiddenCoursesStore';
import { deleteTempSaveData, loadTempSaveData, setTempSaveData } from '$stores/localTempSaveDataHelpers';
import { Schedules } from '$stores/Schedules';
import { useTabStore } from '$stores/TabStore';
import type {
    ScheduleCourse,
    ScheduleSaveState,
    RepeatingCustomEvent,
    CustomEventId,
    AATerm,
} from '@packages/antalmanac-types';

class AppStore extends EventEmitter {
    schedule: Schedules;

    customEvents: RepeatingCustomEvent[];

    colorPickers: Record<string, EventEmitter>;

    eventsInCalendar: CalendarEvent[];

    finalsEventsInCalendar: CourseEvent[];

    unsavedChanges: boolean;

    constructor() {
        super();
        this.setMaxListeners(300);
        this.customEvents = [];
        this.schedule = new Schedules();
        this.colorPickers = {};
        this.eventsInCalendar = [];
        this.finalsEventsInCalendar = [];
        this.unsavedChanges = false;

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

    getCurrentSchedule() {
        return this.schedule.getCurrentSchedule();
    }

    getScheduleNames() {
        return this.schedule.getScheduleNames();
    }

    getCurrentScheduleId() {
        return this.schedule.getCurrentScheduleId();
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

    getAddedSectionCodes() {
        return this.schedule.getAddedSectionCodes();
    }

    getCurrentScheduleNote() {
        return this.schedule.getCurrentScheduleNote();
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

    deleteCourse(sectionCode: string, term: AATerm, scheduleIndex: number, triggerUnsavedWarning = true) {
        const scheduleId = this.schedule.getScheduleId(scheduleIndex);
        this.schedule.deleteCourse(sectionCode, term, scheduleIndex);
        if (scheduleId) {
            useHiddenCoursesStore.getState().clearCourseVisibility(scheduleId, term, sectionCode);
        }
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

    deleteCourses(sectionCodes: string[], term: AATerm, scheduleIndex: number, triggerUnsavedWarning = true) {
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

    reorderAddedCourses(scheduleIndex: number, movedOfferingKey: string, nextOfferingKey: string | null) {
        this.schedule.reorderAddedCourses(scheduleIndex, movedOfferingKey, nextOfferingKey);
        this.unsavedChanges = true;
        const action: ReorderAddedCoursesAction = {
            type: 'reorderAddedCourses',
            scheduleIndex: scheduleIndex,
            movedOfferingKey,
            nextOfferingKey,
        };
        actionTypesStore.autoSaveSchedule(action);
        this.emit('addedCoursesChange');
    }

    private async loadScheduleFromSaveState(savedSchedule: ScheduleSaveState) {
        try {
            await this.schedule.fromScheduleSaveState(savedSchedule);
            return true;
        } catch {
            return false;
        }
    }

    async loadSchedule(savedSchedule: ScheduleSaveState) {
        const loadedStateMatchesCurrent =
            JSON.stringify(this.schedule.getScheduleAsSaveState()) === JSON.stringify(savedSchedule);
        const loadSuccess = await this.loadScheduleFromSaveState(savedSchedule);
        if (!loadSuccess) {
            return false;
        }
        this.unsavedChanges = false;

        this.schedule.clearPreviousStates();

        if (loadedStateMatchesCurrent) {
            deleteTempSaveData();
        } else {
            loadTempSaveData(savedSchedule.schedules.length);
        }

        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
        this.emit('scheduleNamesChange');
        this.emit('currentScheduleIndexChange');
        this.emit('scheduleNotesChange');

        return true;
    }

    loadFallbackSchedule(savedSchedule: ScheduleSaveState) {
        useFallbackStore.getState().loadFallbackSchedules(savedSchedule.schedules);

        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
        this.emit('scheduleNamesChange');
        this.emit('currentScheduleIndexChange');
        this.emit('scheduleNotesChange');

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
        const scheduleId = this.schedule.getCurrentScheduleId();
        this.schedule.clearCurrentSchedule();
        useHiddenCoursesStore.getState().clearScheduleVisibility(scheduleId);
        this.unsavedChanges = true;
        const action: ClearScheduleAction = {
            type: 'clearSchedule',
        };
        actionTypesStore.autoSaveSchedule(action);
        this.emit('addedCoursesChange');
        this.emit('customEventsChange');
    }

    deleteSchedule(scheduleIndex: number) {
        const scheduleId = this.schedule.getScheduleId(scheduleIndex);
        this.schedule.deleteSchedule(scheduleIndex);
        if (scheduleId) {
            useHiddenCoursesStore.getState().clearScheduleVisibility(scheduleId);
        }
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

    changeCourseColor(sectionCode: string, term: AATerm, newColor: string) {
        this.schedule.changeCourseColor(sectionCode, term, newColor);
        this.unsavedChanges = true;
        const action: ChangeCourseColorAction = {
            type: 'changeCourseColor',
            sectionCode: sectionCode,
            term: term,
            newColor: newColor,
        };
        actionTypesStore.autoSaveSchedule(action);
        this.colorPickers[courseColorKey(term, sectionCode)]?.emit('colorChange', newColor);
        this.emit('colorChange', false);
    }

    updateScheduleNote(newScheduleNote: string, scheduleIndex: number) {
        this.schedule.updateScheduleNote(newScheduleNote, scheduleIndex);
        this.emit('scheduleNotesChange');
    }

    termsInSchedule = (term: AATerm): Set<AATerm> => {
        const map = new Map<string, AATerm>();
        map.set(term.shortName, term);
        for (const course of this.schedule.getCurrentCourses()) {
            if (!map.has(course.term.shortName)) {
                map.set(course.term.shortName, course.term);
            }
        }
        return new Set(map.values());
    };

    getPreviousStates = () => this.schedule.getPreviousStates();
}

const store = new AppStore();

export default store;
