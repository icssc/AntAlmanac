import { EventEmitter } from 'events';

import { RepeatingCustomEvent, ScheduleCourse } from '@packages/antalmanac-types';

import { autoSaveSchedule } from '$actions/AppStoreActions';
import trpc from '$lib/api/trpc';
import {
    getLocalStorageAutoSave,
    getLocalStorageUnsavedActions,
    removeLocalStorageUnsavedActions,
    setLocalStorageUnsavedActions,
} from '$lib/localStorage';
import AppStore from '$stores/AppStore';
import { scheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';

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
    scheduleIndex: number;
}

export interface AddCustomEventAction {
    type: 'addCustomEvent';
    customEvent: RepeatingCustomEvent;
    scheduleIndices: number[];
}

export interface DeleteCustomEventAction {
    type: 'deleteCustomEvent';
    customEventId: number;
    scheduleIndices: number[];
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

export interface ReorderScheduleAction {
    type: 'reorderSchedule';
    from: number;
    to: number;
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
    | ReorderScheduleAction
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
        const sessionStore = useSessionStore.getState();
        const autoSave = typeof Storage !== 'undefined' && getLocalStorageAutoSave() == 'true';

        if (!sessionStore.sessionIsValid || !sessionStore.session) {
            if (autoSave) {
                scheduleComponentsToggleStore.getState().setOpenAutoSaveWarning(true);
            }
            return;
        }

        if (autoSave) {
            const providerId = await trpc.userData.getUserAndAccountBySessionToken
                .query({
                    token: sessionStore.session,
                })
                .then((res) => res.accounts.providerAccountId);

            if (providerId) {
                this.emit('autoSaveStart');
                await autoSaveSchedule(providerId);
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

    async loadScheduleFromUnsavedActions() {
        const unsavedActionsString = getLocalStorageUnsavedActions();
        if (unsavedActionsString == null) {
            return;
        }
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
                    AppStore.schedule.deleteCourse(action.sectionCode, action.term, action.scheduleIndex);
                    break;
                case 'addCustomEvent':
                    AppStore.schedule.addCustomEvent(action.customEvent, action.scheduleIndices);
                    break;
                case 'deleteCustomEvent':
                    AppStore.schedule.deleteCustomEvent(action.customEventId, action.scheduleIndices);
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
                case 'reorderSchedule':
                    AppStore.schedule.reorderSchedule(action.from, action.to);
                    break;
                default:
                    break;
            }
        });
    }
}

const actionTypesStore = new ActionTypesStore();
export default actionTypesStore;
