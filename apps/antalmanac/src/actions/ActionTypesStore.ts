import { EventEmitter } from 'events';
import { RepeatingCustomEvent, ScheduleCourse } from '@packages/antalmanac-types';
import { autoSaveSchedule } from '$actions/AppStoreActions';
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

export interface CopyScheduleAction {
    type: 'copySchedule';
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
        const autoSave = typeof Storage !== 'undefined' && window.localStorage.getItem('autoSave') == 'true';
        if (autoSave) {
            const savedUserID = window.localStorage.getItem('userID');

            if (savedUserID) {
                this.emit('autoSaveStart');
                await autoSaveSchedule(savedUserID);
                AppStore.unsavedChanges = false;
                this.emit('autoSaveEnd');
            }
        } else {
            const unsavedActionsString = window.localStorage.getItem('unsavedActions');
            if (unsavedActionsString == null) {
                const unsavedActions = [action];
                localStorage.setItem('unsavedActions', JSON.stringify(unsavedActions));
            } else {
                let unsavedActions = parseUnsavedActionsString(unsavedActionsString);
                if (unsavedActions.length > MAX_UNSAVED_ACTIONS) {
                    unsavedActions = unsavedActions.slice(100);
                }
                unsavedActions.push(action);
                localStorage.setItem('unsavedActions', JSON.stringify(unsavedActions));
            }
        }
    }

    async loadScheduleFromLocalSave() {
        const unsavedActionsString = window.localStorage.getItem('unsavedActions');

        if (unsavedActionsString == null) return;
        if (!confirm('You have unsaved changes. Would you like to load them?')) {
            window.localStorage.removeItem('unsavedActions');
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
                case 'copySchedule':
                    AppStore.schedule.copySchedule(action.to);
                    break;
                default:
                    break;
            }
        });
    }
}

const actionTypesStore = new ActionTypesStore();
export default actionTypesStore;
