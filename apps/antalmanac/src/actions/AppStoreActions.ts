import { VariantType } from 'notistack';

import { WebsocSection } from 'peterportal-api-next-types';
import { ScheduleCourse, TermNames } from '@packages/antalmanac-types';
import { SnackbarPosition } from '$components/AppBar/NotificationSnackbar';
import { RepeatingCustomEvent } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { CourseDetails, courseNumAsDecimal } from '$lib/helpers';
import trpc from '$lib/api/trpc';
import { saveAuthenticatedUserSchedule, saveCodeUserSchedule } from '$actions/helpers';
import AppStore from '$stores/AppStore';

export const addCourse = (
    section: WebsocSection,
    courseDetails: CourseDetails,
    term: TermNames,
    scheduleIndex: number
) => {
    logAnalytics({
        category: analyticsEnum.classSearch.title,
        action: analyticsEnum.classSearch.actions.ADD_COURSE,
        label: courseDetails.deptCode,
        value: courseNumAsDecimal(courseDetails.courseNumber),
    });

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

export const saveSchedule = async (userID: string, rememberMe: boolean) => {
    logAnalytics({
        category: analyticsEnum.nav.title,
        action: analyticsEnum.nav.actions.SAVE_SCHEDULE,
        label: userID,
        value: rememberMe ? 1 : 0,
    });

    const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();

    if (AppStore.isAuthedUser()) {
        await saveAuthenticatedUserSchedule(userID, scheduleSaveState);
    } else if (userID) {
        userID = userID.replace(/\s+/g, '');

        if (userID.length > 0) {
            if (rememberMe) {
                window.localStorage.setItem('userID', userID);
            } else {
                window.localStorage.removeItem('userID');
            }
            await saveCodeUserSchedule(userID, scheduleSaveState);
        }
    }
};

const loadAuthUser = async () => {
    try {
        const tempUserData = window.localStorage.getItem('tempUserData');
        if (tempUserData) {
            const scheduleSaveState = JSON.parse(tempUserData);
            if (await AppStore.loadSchedule(scheduleSaveState)) {
                openSnackbar('success', `Your previous schedule has been imported.`);
            } else {
                openSnackbar('error', `Couldn't import your schedule.`);
            }
            window.localStorage.removeItem('tempUserData');
        }

        const authUser = await trpc.authusers.getUserData.query();
        if (authUser) {
            AppStore.user = {
                name: authUser.name,
                email: authUser.email,
                picture: authUser.picture,
            };

            // Append auth schedule if a schedule is imported else load auth schedule
            if (
                (tempUserData && (await AppStore.appendSchedule(authUser.userData))) ||
                (await AppStore.loadSchedule(authUser.userData))
            ) {
                openSnackbar('success', `Your schedule has been loaded.`);
            } else {
                openSnackbar('error', `Couldn't load your schedule.`);
            }
            return true;
        }
    } catch {
        // Do nothing
    }
    return false;
};

const loadCodeUser = async (userId?: string, rememberMe?: boolean) => {
    if (userId === undefined) {
        return;
    }

    userId = userId.replace(/\s+/g, '');

    if (userId.length > 0) {
        if (rememberMe) {
            window.localStorage.setItem('userID', userId);
        } else {
            window.localStorage.removeItem('userID');
        }

        try {
            const scheduleSaveState = await trpc.users.getUserData.query({ userId });

            if (scheduleSaveState === undefined) {
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
            openSnackbar(
                'error',
                `Failed to load schedules. If this continues to happen, please submit a feedback form.`
            );
        }
    }
};

export const loadSchedule = async (userId?: string, rememberMe?: boolean) => {
    logAnalytics({
        category: analyticsEnum.nav.title,
        action: analyticsEnum.nav.actions.LOAD_SCHEDULE,
        label: userId,
        value: rememberMe ? 1 : 0,
    });
    if (
        AppStore.hasUnsavedChanges() &&
        !window.confirm(`Are you sure you want to load a different schedule? You have unsaved changes!`)
    ) {
        return;
    }

    if (!(await loadAuthUser())) {
        await loadCodeUser(userId, rememberMe);
    }
};

export const appendSchedule = async (userId: string, rememberMe: boolean) => {
    logAnalytics({
        category: analyticsEnum.nav.title,
        action: analyticsEnum.nav.actions.APPEND_SCHEDULE,
        label: userId,
        value: rememberMe ? 1 : 0,
    });

    userId = userId.replace(/\s+/g, '');

    if (userId.length <= 0) {
        return;
    }
    if (rememberMe) {
        window.localStorage.setItem('userID', userId);
    } else {
        window.localStorage.removeItem('userID');
    }

    try {
        const scheduleSaveState = await trpc.users.getUserData.query({ userId });

        if (scheduleSaveState === undefined) {
            openSnackbar('error', `Couldn't find schedules for username "${userId}".`);
        } else if (await AppStore.appendSchedule(scheduleSaveState)) {
            openSnackbar('success', `Schedule for username "${userId}" loaded.`);
        } else {
            openSnackbar(
                'error',
                `Couldn't load schedules for username "${userId}". 
                If this continues happening please submit a feedback form.`
            );
        }
    } catch (e) {
        openSnackbar('error', `Got a network error when trying to load schedules.`);
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

export const copySchedule = (to: number) => {
    logAnalytics({
        category: analyticsEnum.addedClasses.title,
        action: analyticsEnum.addedClasses.actions.COPY_SCHEDULE,
    });

    AppStore.copySchedule(to);
};

export const toggleTheme = (radioGroupEvent: React.ChangeEvent<HTMLInputElement>) => {
    AppStore.toggleTheme(radioGroupEvent.target.value);
    logAnalytics({
        category: analyticsEnum.nav.title,
        action: analyticsEnum.nav.actions.CHANGE_THEME,
        label: radioGroupEvent.target.value,
    });
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
