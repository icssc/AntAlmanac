import { RepeatingCustomEvent, ScheduleCourse } from '@packages/antalmanac-types';

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
