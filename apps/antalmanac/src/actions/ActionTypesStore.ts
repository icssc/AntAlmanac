import { EventEmitter } from 'events';

import { autoSaveSchedule } from '$actions/AppStoreActions';
import { getAuthState } from '$lib/auth/useAuth';
import { getLocalStorageAutoSave } from '$lib/localStorage';
import { postHog } from '$providers/AppPostHogProvider';
import { useScheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import type { AATerm, CustomEventId, RepeatingCustomEvent, ScheduleCourse } from '@packages/antalmanac-types';

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
    term: AATerm;
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

export interface ReorderAddedCoursesAction {
    type: 'reorderAddedCourses';
    scheduleIndex: number;
    movedOfferingKey: string;
    nextOfferingKey: string | null;
}

export interface ChangeCourseColorAction {
    type: 'changeCourseColor';
    sectionCode: string;
    term: AATerm;
    newColor: string;
}

type ActionType =
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
    | ReorderAddedCoursesAction
    | ChangeCourseColorAction
    | UndoRedoAction;

class ActionTypesStore extends EventEmitter {
    async autoSaveSchedule(_action: ActionType) {
        const { isLoggedIn, userId } = getAuthState();
        const autoSave = typeof Storage !== 'undefined' && getLocalStorageAutoSave() === 'true';

        if (!isLoggedIn || !userId) {
            if (autoSave) {
                useScheduleComponentsToggleStore.getState().setOpenAutoSaveWarning(true);
            }
            return;
        }

        if (!autoSave) {
            return;
        }

        this.emit('autoSaveStart');
        await autoSaveSchedule({ postHog });
        this.emit('autoSaveEnd');
    }
}

const actionTypesStore = new ActionTypesStore();
export default actionTypesStore;
