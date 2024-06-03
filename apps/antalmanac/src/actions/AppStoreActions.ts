import { RepeatingCustomEvent, ScheduleCourse, ShortCourseSchedule } from '@packages/antalmanac-types';
import { TRPCError } from '@trpc/server';
import { VariantType } from 'notistack';
import { WebsocSection } from 'peterportal-api-next-types';

import { SnackbarPosition } from '$components/NotificationSnackbar';
import analyticsEnum, { logAnalytics, courseNumAsDecimal } from '$lib/analytics';
import trpc from '$lib/api/trpc';
import { CourseDetails } from '$lib/course_data.types';
import { warnMultipleTerms } from '$lib/helpers';
import { removeLocalStorageUserId, setLocalStorageUserId } from '$lib/localStorage';
import AppStore from '$stores/AppStore';

export interface CopyScheduleOptions {
    onSuccess: (index: number) => unknown;
    onError: (index: number) => unknown;
}

export const addCourse = (
    section: WebsocSection,
    courseDetails: CourseDetails,
    term: string,
    scheduleIndex: number,
    quiet?: boolean
) => {
    logAnalytics({
        category: analyticsEnum.classSearch.title,
        action: analyticsEnum.classSearch.actions.ADD_COURSE,
        label: courseDetails.deptCode,
        value: courseNumAsDecimal(courseDetails.courseNumber),
    });
    const terms = AppStore.termsInSchedule(term);

    if (terms.size > 1 && !quiet) warnMultipleTerms(terms);

    // The color will be set properly in Schedules
    const newCourse: ScheduleCourse = {
        term: term,
        deptCode: courseDetails.deptCode,
        courseNumber: courseDetails.courseNumber,
        courseTitle: courseDetails.courseTitle,
        courseComment: courseDetails.courseComment,
        prerequisiteLink: courseDetails.prerequisiteLink,
        section: { ...section, color: '' },
    };

    return AppStore.addCourse(newCourse, scheduleIndex);
};
/**
 * @param variant usually 'info', 'error', 'warning', or 'success'
 * @param message any string to display
 * @param duration in seconds and is optional.
 * @param styles object containing css-in-js object, like {[propertyName]: string}
 * if anyone comes back to refactor this, I think `notistack` provides its own types we could use.
 */
export const openSnackbar = (
    variant: VariantType,
    message: string,
    duration?: number,
    position?: SnackbarPosition,
    style?: { [cssPropertyName: string]: string }
) => {
    AppStore.openSnackbar(variant, message, duration, position, style);
};

function isEmptySchedule(schedules: ShortCourseSchedule[]) {
    for (const schedule of schedules) {
        if (schedule.courses.length > 0) {
            return false;
        }

        if (schedule.customEvents.length > 0) {
            return false;
        }

        if (schedule.scheduleNote !== '') {
            return false;
        }
    }

    return true;
}

export const saveSchedule = async (userID: string, rememberMe: boolean) => {
    logAnalytics({
        category: analyticsEnum.nav.title,
        action: analyticsEnum.nav.actions.SAVE_SCHEDULE,
        label: userID,
        value: rememberMe ? 1 : 0,
    });

    if (userID != null) {
        userID = userID.replace(/\s+/g, '');

        if (userID.length > 0) {
            if (rememberMe) {
                setLocalStorageUserId(userID);
            } else {
                removeLocalStorageUserId();
            }

            const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();

            if (
                isEmptySchedule(scheduleSaveState.schedules) &&
                !confirm(
                    "You are attempting to save empty schedule(s). If this is unintentional, this may overwrite your existing schedules that haven't loaded yet!"
                )
            ) {
                return;
            }

            try {
                await trpc.users.saveUserData.mutate({
                    id: userID,
                    data: {
                        id: userID,
                        userData: scheduleSaveState,
                    },
                });

                openSnackbar(
                    'success',
                    `Schedule saved under username "${userID}". Don't forget to sign up for classes on WebReg!`
                );
                AppStore.saveSchedule();
            } catch (e) {
                if (e instanceof TRPCError) {
                    openSnackbar('error', `Schedule could not be saved under username "${userID}`);
                } else {
                    openSnackbar('error', 'Network error or server is down.');
                }
            }
        }
    }
};

export async function autoSaveSchedule(userID: string) {
    logAnalytics({
        category: analyticsEnum.nav.title,
        action: analyticsEnum.nav.actions.SAVE_SCHEDULE,
        label: userID,
    });
    if (userID == null) return;
    userID = userID.replace(/\s+/g, '');

    if (userID.length < 0) return;
    const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();

    try {
        await trpc.users.saveUserData.mutate({
            id: userID,
            data: {
                id: userID,
                userData: scheduleSaveState,
            },
        });

        AppStore.saveSchedule();
    } catch (e) {
        if (e instanceof TRPCError) {
            openSnackbar('error', `Schedule could not be auto-saved under username "${userID}`);
        } else {
            openSnackbar('error', 'Network error or server is down.');
        }
    }
}

export const loadSchedule = async (userId: string, rememberMe: boolean) => {
    logAnalytics({
        category: analyticsEnum.nav.title,
        action: analyticsEnum.nav.actions.LOAD_SCHEDULE,
        label: userId,
        value: rememberMe ? 1 : 0,
    });
    if (
        userId != null &&
        (!AppStore.hasUnsavedChanges() ||
            window.confirm(`Are you sure you want to load a different schedule? You have unsaved changes!`))
    ) {
        userId = userId.replace(/\s+/g, '');
        if (userId.length > 0) {
            if (rememberMe) {
                setLocalStorageUserId(userId);
            } else {
                removeLocalStorageUserId();
            }

            try {
                const res = await trpc.users.getUserData.query({ userId });
                const scheduleSaveState = res && 'userData' in res ? res.userData : res;

                if (scheduleSaveState == null) {
                    openSnackbar('error', `Couldn't find schedules for username "${userId}".`);
                } else if (await AppStore.loadSchedule(scheduleSaveState)) {
                    openSnackbar('success', `Schedule for username "${userId}" loaded.`);
                } else {
                    AppStore.loadSkeletonSchedule(scheduleSaveState);
                    openSnackbar(
                        'error',
                        `Network error loading course information for "${userId}". 	              
                        If this continues to happen, please submit a feedback form.`
                    );
                }
            } catch (e) {
                console.error(e);
                openSnackbar(
                    'error',
                    `Failed to load schedules. If this continues to happen, please submit a feedback form.`
                );
            }
        }
    }
};

export const deleteCourse = (sectionCode: string, term: string) => {
    AppStore.deleteCourse(sectionCode, term);
};

export const deleteCustomEvent = (customEventID: number) => {
    AppStore.deleteCustomEvent(customEventID);
};

export const editCustomEvent = (editedCustomEvent: RepeatingCustomEvent, newScheduleIndices: number[]) => {
    AppStore.editCustomEvent(editedCustomEvent, newScheduleIndices);
};

export const clearSchedules = () => {
    AppStore.clearSchedule();
};

export const addCustomEvent = (customEvent: RepeatingCustomEvent, scheduleIndices: number[]) => {
    AppStore.addCustomEvent(customEvent, scheduleIndices);
};

export const undoDelete = (event: KeyboardEvent | null) => {
    if (event == null || (event.keyCode === 90 && (event.ctrlKey || event.metaKey))) {
        AppStore.undoAction();
    }
};

export const changeCurrentSchedule = (newScheduleIndex: number) => {
    AppStore.changeCurrentSchedule(newScheduleIndex);
};

export const changeCustomEventColor = (customEventID: number, newColor: string) => {
    AppStore.changeCustomEventColor(customEventID, newColor);
};

export const changeCourseColor = (sectionCode: string, term: string, newColor: string) => {
    AppStore.changeCourseColor(sectionCode, term, newColor);
};

export const copySchedule = (to: number, options?: CopyScheduleOptions) => {
    logAnalytics({
        category: analyticsEnum.addedClasses.title,
        action: analyticsEnum.addedClasses.actions.COPY_SCHEDULE,
    });

    try {
        AppStore.copySchedule(to);
        options?.onSuccess(to);
    } catch (error) {
        options?.onError(to);
    }
};

export const addSchedule = (scheduleName: string) => {
    AppStore.addSchedule(scheduleName);
};

export const renameSchedule = (scheduleName: string, scheduleIndex: number) => {
    AppStore.renameSchedule(scheduleName, scheduleIndex);
};

export const deleteSchedule = (scheduleIndex: number) => {
    AppStore.deleteSchedule(scheduleIndex);
};

export const updateScheduleNote = (newScheduleNote: string, scheduleIndex: number) => {
    AppStore.updateScheduleNote(newScheduleNote, scheduleIndex);
};
