import { EventEmitter } from 'events';
import { RepeatingCustomEvent, ScheduleCourse } from '@packages/antalmanac-types';
import { saveSchedule } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';

export interface BaseAction {
    type: string;
}

export interface UndoAction extends BaseAction {
    type: 'undoAction';
}

export interface AddCourseAction extends BaseAction {
    type: 'addCourse';
    course: ScheduleCourse;
    scheduleIndex: number;
}

export interface DeleteCourseAction extends BaseAction {
    type: 'deleteCourse';
    sectionCode: string;
    term: string;
}

export interface AddCustomEventAction extends BaseAction {
    type: 'addCustomEvent';
    customEvent: RepeatingCustomEvent;
    scheduleIndices: number[];
}

export interface DeleteCustomEventAction extends BaseAction {
    type: 'deleteCustomEvent';
    customEventId: number;
}

export interface EditCustomEventAction extends BaseAction {
    type: 'editCustomEvent';
    editedCustomEvent: RepeatingCustomEvent;
    newScheduleIndices: number[];
}

export interface ChangeCustomEventColorAction extends BaseAction {
    type: 'changeCustomEventColor';
    customEventId: number;
    newColor: string;
}

export interface ClearScheduleAction extends BaseAction {
    type: 'clearSchedule';
}

export interface CopyScheduleAction extends BaseAction {
    type: 'copySchedule';
    to: number;
}

export interface ChangeCourseColorAction extends BaseAction {
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
                await saveSchedule(savedUserID, true, true);
                AppStore.unsavedChanges = false;
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
    }

    async loadScheduleFromLocalSave() {
        const unsavedActionsString = window.localStorage.getItem('unsavedActions');
        if (unsavedActionsString !== null) {
            if (confirm('You have unsaved changes. Would you like to load them?')) {
                for (const action of JSON.parse(unsavedActionsString)) {
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
                }
            } else {
                window.localStorage.removeItem('unsavedActions');
            }
        }
    }
}

const actionTypesStore = new ActionTypesStore();
export default actionTypesStore;
