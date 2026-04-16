import { EventEmitter } from 'events';

import { autoSaveSchedule } from '$actions/AppStoreActions';
import trpc from '$lib/api/trpc';
import { getLocalStorageAutoSave } from '$lib/localStorage';
import AppStore from '$stores/AppStore';
import { scheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';
import type { CustomEventId, RepeatingCustomEvent, ScheduleCourse } from '@packages/antalmanac-types';

export interface UndoRedoAction {
    type: 'undoRedoAction';
    direction: 'undo' | 'redo';
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
    customEventId: CustomEventId;
    scheduleIndices: number[];
}

export interface EditCustomEventAction {
    type: 'editCustomEvent';
    editedCustomEvent: RepeatingCustomEvent;
    newScheduleIndices: number[];
}

export interface ChangeCustomEventColorAction {
    type: 'changeCustomEventColor';
    customEventId: CustomEventId;
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

export interface UpdateScheduleNoteAction {
    type: 'updateScheduleNote';
    newScheduleNote: string;
    scheduleIndex: number;
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
    | UpdateScheduleNoteAction
    | UndoRedoAction;

class ActionTypesStore extends EventEmitter {
    constructor() {
        super();
    }

    async autoSaveSchedule(_action: ActionType) {
        const sessionStore = useSessionStore.getState();
        const autoSave = typeof Storage !== 'undefined' && getLocalStorageAutoSave() == 'true';

        if (!sessionStore.sessionIsValid || !sessionStore.session) {
            if (autoSave) {
                scheduleComponentsToggleStore.getState().setOpenAutoSaveWarning(true);
            }
            return;
        }

        if (autoSave) {
            const { users, accounts } = await trpc.userData.getUserAndAccountBySessionToken.query({
                token: sessionStore.session,
            });

            if (accounts.providerAccountId) {
                this.emit('autoSaveStart');
                try {
                    await autoSaveSchedule(accounts.providerAccountId, { userInfo: users });
                    AppStore.unsavedChanges = false;
                } finally {
                    this.emit('autoSaveEnd');
                }
            }
        }
    }
}

const actionTypesStore = new ActionTypesStore();
export default actionTypesStore;
