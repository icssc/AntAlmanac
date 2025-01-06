import { EventEmitter } from 'events';

import { RepeatingCustomEvent, ScheduleCourse } from '@packages/antalmanac-types';

import { autoSaveSchedule } from '$actions/AppStoreActions';
import {
    getLocalStorageAutoSave,
    getLocalStorageUnsavedActions,
    getLocalStorageUserId,
    removeLocalStorageUnsavedActions,
    setLocalStorageUnsavedActions,
} from '$lib/localStorage';
import AppStore from '$stores/AppStore';

const MAX_UNSAVED_ACTIONS = 1000;

export interface UndoAction {
    type: 'undoAction';
}

export interface AddCourseAction {
    type: 'addCourse';
    course: ScheduleCourse;
    scheduleIndex: number;
}

export interface DeleteCourseAction {
    type: 'deleteCourse';
    sectionCode: string;
    term: string;
}

export interface AddCustomEventAction {
    type: 'addCustomEvent';
    customEvent: RepeatingCustomEvent;
    scheduleIndices: number[];
}

export interface DeleteCustomEventAction {
    type: 'deleteCustomEvent';
    customEventId: number;
}

export interface EditCustomEventAction {
    type: 'editCustomEvent';
    editedCustomEvent: RepeatingCustomEvent;
    newScheduleIndices: number[];
}

export interface ChangeCustomEventColorAction {
    type: 'changeCustomEventColor';
    customEventId: number;
    newColor: string;
}

export interface ClearScheduleAction {
    type: 'clearSchedule';
}

export interface AddScheduleAction {
    type: 'addSchedule';
    newScheduleName: string;
}

export interface RenameScheduleAction {
    type: 'renameSchedule';
    scheduleIndex: number;
    newScheduleName: string;
}

export interface DeleteScheduleAction {
    type: 'deleteSchedule';
    scheduleIndex: number;
}

export interface CopyScheduleAction {
    type: 'copySchedule';
    scheduleIndex: number;
    newScheduleName: string;
}

export interface ChangeCourseColorAction {
    type: 'changeCourseColor';
    sectionCode: string;
    term: string;
    newColor: string;
}

export type ActionType =
    | AddCourseAction
    | DeleteCourseAction
    | AddCustomEventAction
    | DeleteCustomEventAction
    | EditCustomEventAction
    | ChangeCustomEventColorAction
    | ClearScheduleAction
    | AddScheduleAction
    | RenameScheduleAction
    | DeleteScheduleAction
    | CopyScheduleAction
    | ChangeCourseColorAction
    | UndoAction;

function parseUnsavedActionsString(unsavedActionsString: string): ActionType[] {
    try {
        return JSON.parse(unsavedActionsString);
    } catch {
        return [];
    }
}

class ActionTypesStore extends EventEmitter {
    constructor() {
        super();
    }

    async autoSaveSchedule(action: ActionType) {
        const autoSave = typeof Storage !== 'undefined' && getLocalStorageAutoSave() == 'true';
        if (autoSave) {
            const savedUserID = getLocalStorageUserId();

            if (savedUserID) {
                this.emit('autoSaveStart');
                await autoSaveSchedule(savedUserID);
                AppStore.unsavedChanges = false;
                this.emit('autoSaveEnd');
            }
        } else {
            const unsavedActionsString = getLocalStorageUnsavedActions();
            if (unsavedActionsString == null) {
                const unsavedActions = [action];
                setLocalStorageUnsavedActions(JSON.stringify(unsavedActions));
            } else {
                let unsavedActions = parseUnsavedActionsString(unsavedActionsString);
                if (unsavedActions.length > MAX_UNSAVED_ACTIONS) {
                    unsavedActions = unsavedActions.slice(100);
                }
                unsavedActions.push(action);
                setLocalStorageUnsavedActions(JSON.stringify(unsavedActions));
            }
        }
    }

    async loadScheduleFromLocalSave() {
        const unsavedActionsString = getLocalStorageUnsavedActions();

        if (unsavedActionsString == null) return;
        if (!confirm('You have unsaved changes. Would you like to load them?')) {
            removeLocalStorageUnsavedActions();
            return;
        }

        const actions = parseUnsavedActionsString(unsavedActionsString);

        actions.forEach((action) => {
            switch (action.type) {
                case 'addCourse':
                    AppStore.schedule.addCourse(action.course, action.scheduleIndex);
                    break;
                case 'deleteCourse':
                    AppStore.schedule.deleteCourse(action.sectionCode, action.term);
                    break;
                case 'addCustomEvent':
                    AppStore.schedule.addCustomEvent(action.customEvent, action.scheduleIndices);
                    break;
                case 'deleteCustomEvent':
                    AppStore.schedule.deleteCustomEvent(action.customEventId);
                    break;
                case 'editCustomEvent':
                    AppStore.schedule.editCustomEvent(action.editedCustomEvent, action.newScheduleIndices);
                    break;
                case 'changeCustomEventColor':
                    AppStore.schedule.changeCustomEventColor(action.customEventId, action.newColor);
                    break;
                case 'changeCourseColor':
                    AppStore.schedule.changeCourseColor(action.sectionCode, action.term, action.newColor);
                    break;
                case 'clearSchedule':
                    AppStore.schedule.clearCurrentSchedule();
                    break;
                case 'addSchedule':
                    AppStore.schedule.addNewSchedule(action.newScheduleName);
                    break;
                case 'renameSchedule':
                    AppStore.schedule.renameSchedule(action.scheduleIndex, action.newScheduleName);
                    break;
                case 'copySchedule':
                    AppStore.schedule.copySchedule(action.scheduleIndex, action.newScheduleName);
                    break;
                case 'deleteSchedule':
                    AppStore.schedule.deleteSchedule(action.scheduleIndex);
                    break;
                default:
                    break;
            }
        });
    }
}

const actionTypesStore = new ActionTypesStore();
export default actionTypesStore;
