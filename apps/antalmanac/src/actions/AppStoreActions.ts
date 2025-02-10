import type {
    CourseDetails,
    RepeatingCustomEvent,
    ScheduleCourse,
    ShortCourseSchedule,
    User,
    WebsocSection,
} from '@packages/antalmanac-types';
import { TRPCError } from '@trpc/server';
import { VariantType } from 'notistack';

import { SnackbarPosition } from '$components/NotificationSnackbar';
import analyticsEnum, { logAnalytics, courseNumAsDecimal } from '$lib/analytics';
import trpc from '$lib/api/trpc';
import { warnMultipleTerms } from '$lib/helpers';
import { getLocalStorageDataCache, removeLocalStorageDataCache } from '$lib/localStorage';
import AppStore from '$stores/AppStore';
import { useSessionStore } from '$stores/SessionStore';
export interface CopyScheduleOptions {
    onSuccess: (scheduleName: string) => unknown;
    onError: (scheduleName: string) => unknown;
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

export function isEmptySchedule(schedules: ShortCourseSchedule[]) {
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

export const saveSchedule = async (userID: string) => {
    if (userID != null && userID.length > 0) {
        const account = await trpc.users.getAccountByUid.query({ userId: userID });
        logAnalytics({
            category: analyticsEnum.nav.title,
            action: analyticsEnum.nav.actions.SAVE_SCHEDULE,
            label: userID,
            value: account.AccountType === 'GUEST' ? 1 : 0,
        });

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

            openSnackbar('success', `Schedule saved! Don't forget to sign up for classes on WebReg!`);
            AppStore.saveSchedule();
        } catch (e) {
            if (e instanceof TRPCError) {
                openSnackbar('error', `Schedule could not be saved`);
            } else {
                openSnackbar('error', 'Network error or server is down.');
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

const mergeSchedules = (schedules: ShortCourseSchedule[], incomingSchedule: ShortCourseSchedule[]) => {
    const existingScheduleNames = new Set(schedules.map((s: ShortCourseSchedule) => s.scheduleName));
    const cacheSchedule = incomingSchedule.map((schedule: ShortCourseSchedule) => {
        let scheduleName = schedule.scheduleName;
        if (existingScheduleNames.has(schedule.scheduleName)) {
            scheduleName = scheduleName + '(1)';
        }
        return {
            ...schedule,
            scheduleName: '(RESTORED)-' + scheduleName,
        };
    });
    schedules.push(...cacheSchedule);
};

export const loadSchedule = async (loadCache = false) => {
    const session = useSessionStore.getState();
    try {
        const { users, accounts } = await trpc.users.getUserAndAccountBySessionToken.query({
            token: session.session ?? '',
        });

        const shortCourseSchedules = JSON.parse(getLocalStorageDataCache() ?? 'null');
        removeLocalStorageDataCache();
        if (!users.id) return;

        logAnalytics({
            category: analyticsEnum.nav.title,
            action: analyticsEnum.nav.actions.LOAD_SCHEDULE,
            label: users.id,
            value: accounts.AccountType === 'GUEST' ? 1 : 0,
        });

        const res: User = await trpc.users.getUserData.query({ userId: users.id });
        const scheduleSaveState = res && 'userData' in res ? res.userData : res;

        if (isEmptySchedule(scheduleSaveState.schedules)) return;
        if (loadCache && shortCourseSchedules) {
            mergeSchedules(scheduleSaveState.schedules, shortCourseSchedules);
        }

        if (scheduleSaveState == null && !session.validSession) {
            openSnackbar('error', `Couldn't find schedules :(`);
        } else if (await AppStore.loadSchedule(scheduleSaveState)) {
            openSnackbar('success', `Schedule loaded successfully!`);
            await saveSchedule(users.id);
        } else {
            AppStore.loadSkeletonSchedule(scheduleSaveState);
            openSnackbar(
                'error',
                `Network error loading course information. 	              
                        If this continues to happen, please submit a feedback form.`
            );
        }
    } catch (e) {
        console.error(e);
        // if the session is valid and the user data doesn't load there's a problem
        if (session.validSession) {
            openSnackbar(
                'error',
                `Failed to load schedules. If this continues to happen, please submit a feedback form.`
            );
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

export const copySchedule = (scheduleIndex: number, newScheduleName: string, options?: CopyScheduleOptions) => {
    logAnalytics({
        category: analyticsEnum.addedClasses.title,
        action: analyticsEnum.addedClasses.actions.COPY_SCHEDULE,
    });

    try {
        AppStore.copySchedule(scheduleIndex, newScheduleName);
        options?.onSuccess(newScheduleName);
    } catch (error) {
        options?.onError(newScheduleName);
    }
};

export const addSchedule = (scheduleName: string) => {
    AppStore.addSchedule(scheduleName);
};

export const renameSchedule = (scheduleIndex: number, scheduleName: string) => {
    AppStore.renameSchedule(scheduleIndex, scheduleName);
};

export const deleteSchedule = (scheduleIndex: number) => {
    AppStore.deleteSchedule(scheduleIndex);
};

export const updateScheduleNote = (newScheduleNote: string, scheduleIndex: number) => {
    AppStore.updateScheduleNote(newScheduleNote, scheduleIndex);
};
