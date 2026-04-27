import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import trpc from '$lib/api/trpc';
import { warnMultipleTerms } from '$lib/helpers';
import { setLocalStorageUserId, setLocalStorageDataCache } from '$lib/localStorage';
import { isNativeIosApp, NATIVE_IOS_REDIRECT_URI } from '$lib/platform';
import { getNextScheduleName } from '$lib/utils';
import { IMPORTED_SCHEDULE_PREFIX, SHARED_SCHEDULE_PREFIX } from '$src/globals';
import AppStore from '$stores/AppStore';
import { deleteTempSaveData } from '$stores/localTempSaveDataHelpers';
import { scheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import type {
    CourseDetails,
    CustomEventId,
    RepeatingCustomEvent,
    ScheduleCourse,
    ShortCourseSchedule,
    WebsocSection,
} from '@packages/antalmanac-types';
import { TRPCClientError } from '@trpc/client';
import type { PostHog } from 'posthog-js/react';

export interface CopyScheduleOptions {
    onSuccess: (scheduleName: string) => unknown;
    onError: (scheduleName: string) => unknown;
}

interface AutoSaveScheduleOptions {
    postHog?: PostHog;
}

export const addCourse = (
    section: WebsocSection,
    courseDetails: CourseDetails,
    term: string,
    scheduleIndex: number,
    quiet?: boolean,
    postHog?: PostHog
) => {
    logAnalytics(postHog, {
        category: analyticsEnum.classSearch,
        action: analyticsEnum.classSearch.actions.ADD_COURSE,
        label: courseDetails.deptCode + courseDetails.courseNumber,
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
        sectionTypes: courseDetails.sectionTypes,
    };

    return AppStore.addCourse(newCourse, scheduleIndex);
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

export const saveSchedule = async ({ rememberMe, postHog }: { rememberMe: boolean; postHog?: PostHog }) => {
    logAnalytics(postHog, {
        category: analyticsEnum.nav,
        action: analyticsEnum.nav.actions.SAVE_SCHEDULE,
        value: rememberMe ? 1 : 0,
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
        const result = await trpc.userData.saveUserData.mutate({
            userData: scheduleSaveState,
        });

        if (result?.scheduleIdMap) {
            AppStore.schedule.updateScheduleIds(result.scheduleIdMap);
        }

        openSnackbar('success', `Schedule saved. Don't forget to sign up for classes on WebReg!`);
        deleteTempSaveData();
        AppStore.saveSchedule();
    } catch (e) {
        if (e instanceof TRPCClientError) {
            openSnackbar('error', `Schedule could not be saved`);
        } else {
            openSnackbar('error', 'Network error or server is down.');
        }
    }
};

export async function autoSaveSchedule(options: AutoSaveScheduleOptions) {
    const { postHog } = options;
    logAnalytics(postHog, {
        category: analyticsEnum.nav,
        action: analyticsEnum.nav.actions.SAVE_SCHEDULE,
    });

    const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();
    try {
        const result = await trpc.userData.saveUserData.mutate({
            userData: scheduleSaveState,
        });

        if (result?.scheduleIdMap) {
            AppStore.schedule.updateScheduleIds(result.scheduleIdMap);
        }

        deleteTempSaveData();
        AppStore.saveSchedule();
    } catch (e) {
        if (e instanceof TRPCClientError) {
            openSnackbar('error', 'Schedule could not be auto-saved');
        } else {
            openSnackbar('error', 'Network error or server is down.');
        }
    }
}

export const mergeShortCourseSchedules = (
    currentSchedules: ShortCourseSchedule[],
    incomingSchedule: ShortCourseSchedule[],
    importMessage = ''
) => {
    const existingScheduleNames = new Set(currentSchedules.map((s: ShortCourseSchedule) => s.scheduleName));
    const cacheSchedule = incomingSchedule.map((schedule: ShortCourseSchedule) => {
        const baseName = `${importMessage}${schedule.scheduleName}`;
        const scheduleName = getNextScheduleName(baseName, existingScheduleNames);

        existingScheduleNames.add(scheduleName);

        return {
            ...schedule,
            scheduleName: scheduleName,
        };
    });
    currentSchedules.push(...cacheSchedule);
};

const handleScheduleImport = async (username: string, skipImportedCheck = false) => {
    const session = useSessionStore.getState();
    if (!session.sessionIsValid) {
        throw new Error("Invalid session: User isn't logged in.");
    }

    const incoming = await trpc.userData.getGuestScheduleByUsername.query({ username }).catch(() => {
        throw new Error(`Oops! Schedule "${username}" doesn't seem to exist.`);
    });

    if (!skipImportedCheck && incoming.user.imported) {
        return { imported: true, error: null };
    }

    const scheduleSaveState = incoming.userData;

    const currentSchedules = AppStore.schedule.getScheduleAsSaveState();

    if (scheduleSaveState?.schedules) {
        mergeShortCourseSchedules(currentSchedules.schedules, scheduleSaveState.schedules, IMPORTED_SCHEDULE_PREFIX);
        currentSchedules.scheduleIndex = currentSchedules.schedules.length - 1;

        scheduleComponentsToggleStore.setState({ openImportDialog: false, openLoadingSchedule: true });

        const isScheduleLoaded = await AppStore.loadSchedule(currentSchedules);

        if (!isScheduleLoaded) {
            scheduleComponentsToggleStore.setState({ openLoadingSchedule: false });
            return { imported: false, error: new Error('Failed to load imported schedule') };
        }

        openSnackbar('success', `Schedule with name "${username}" imported successfully!`);

        scheduleComponentsToggleStore.setState({ openScheduleSelect: true, openLoadingSchedule: false });

        await saveSchedule({ rememberMe: true });

        await trpc.userData.flagImportedSchedule.mutate({
            username,
        });
    }

    return { imported: false, error: null };
};

export const importValidatedSchedule = async (username: string) => {
    try {
        return await handleScheduleImport(username, true);
    } catch (e) {
        return { imported: false, error: e };
    }
};

export const importScheduleWithUsername = async (username: string) => {
    try {
        return await handleScheduleImport(username, false);
    } catch (e) {
        return { imported: false, error: e };
    }
};

export const importSharedScheduleById = async (scheduleId: string, friendName?: string) => {
    const sharedSchedule = await trpc.userData.getSharedSchedule.query({ scheduleId });

    const incomingSchedule: ShortCourseSchedule = {
        id: undefined,
        scheduleName: sharedSchedule.scheduleName,
        scheduleNote: sharedSchedule.scheduleNote || '',
        courses: sharedSchedule.courses,
        customEvents: sharedSchedule.customEvents,
    };

    const currentSchedules = AppStore.schedule.getScheduleAsSaveState();
    const prefix = friendName ? `(${friendName})-` : SHARED_SCHEDULE_PREFIX;

    mergeShortCourseSchedules(currentSchedules.schedules, [incomingSchedule], prefix);
    currentSchedules.scheduleIndex = currentSchedules.schedules.length - 1;

    scheduleComponentsToggleStore.setState({ openLoadingSchedule: true });

    const isScheduleLoaded = await AppStore.loadSchedule(currentSchedules);

    if (!isScheduleLoaded) {
        scheduleComponentsToggleStore.setState({ openLoadingSchedule: false });
        return { imported: false, error: new Error('Failed to load shared schedule') };
    }

    const session = useSessionStore.getState();
    if (session.sessionIsValid) {
        try {
            await autoSaveSchedule({});
        } catch {
            openSnackbar(
                'error',
                'Failed to load schedules. If this continues to happen, please submit a feedback form.'
            );
        }
    } else {
        openSnackbar('warning', 'Schedule added to current session. Sign in to save permanently.');
    }

    openSnackbar('success', `Shared schedule "${incomingSchedule.scheduleName}" added to your account!`);

    scheduleComponentsToggleStore.setState({ openScheduleSelect: true, openLoadingSchedule: false });

    changeCurrentSchedule(currentSchedules.scheduleIndex);

    return { imported: true, error: null };
};

export const loadGuestSchedule = async (username: string, rememberMe: boolean, postHog?: PostHog) => {
    logAnalytics(postHog, {
        category: analyticsEnum.nav,
        action: analyticsEnum.nav.actions.LOAD_SCHEDULE,
        label: username,
        value: rememberMe ? 1 : 0,
    });
    if (
        username != null &&
        (!AppStore.hasUnsavedChanges() ||
            window.confirm(`Are you sure you want to load a different schedule? You have unsaved changes!`))
    ) {
        username = username.replace(/\s+/g, '');
        if (username?.length) {
            if (rememberMe) {
                setLocalStorageUserId(username);
            }

            try {
                const result = await trpc.userData.getGuestScheduleByUsername.query({ username });
                const scheduleSaveState = result.userData;

                let error = false;

                if (await AppStore.loadSchedule(scheduleSaveState)) {
                    openSnackbar('success', `Schedule loaded.`);
                } else {
                    AppStore.loadSkeletonSchedule(scheduleSaveState);
                    error = true;
                }

                if (error) {
                    openSnackbar(
                        'error',
                        `Network error loading course information for "${username}". 	              
                        If this continues to happen, please submit a feedback form.`
                    );
                }
            } catch (e) {
                if (e instanceof TRPCClientError) {
                    if (e.data.httpStatus === 404) {
                        openSnackbar('error', e.message);
                    }
                    return;
                }
                openSnackbar(
                    'error',
                    'Failed to load schedules. If this continues to happen, please submit a feedback form.'
                );
            }
        }
    }
};

export const loadSchedule = async () => {
    // logAnalytics({
    //     category: analyticsEnum.nav.title,
    //     action: analyticsEnum.nav.actions.LOAD_SCHEDULE,
    //     label: providerId,
    //     value: rememberMe ? 1 : 0,
    // });
    try {
        const userDataResponse = await trpc.userData.getUserData.query();
        const scheduleSaveState = userDataResponse?.userData;
        if (scheduleSaveState !== undefined && isEmptySchedule(scheduleSaveState.schedules)) {
            return true;
        }

        if (scheduleSaveState === undefined) {
            openSnackbar('error', `Couldn't find schedules for this account`);
        } else if (await AppStore.loadSchedule(scheduleSaveState)) {
            openSnackbar('success', `Schedule loaded.`);
            return true;
        } else {
            AppStore.loadSkeletonSchedule(scheduleSaveState);
            openSnackbar(
                'error',
                `Network error loading course information". 	              
                        If this continues to happen, please submit a feedback form.`
            );
        }
        return false;
    } catch (e) {
        console.error('Error in loadSchedule:', e);
        openSnackbar('error', `Failed to load schedules. If this continues to happen, please submit a feedback form.`);
        return false;
    }
};

const cacheSchedule = () => {
    const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState().schedules;
    if (!isEmptySchedule(scheduleSaveState)) {
        setLocalStorageDataCache(JSON.stringify(scheduleSaveState));
    }
};

export const loginUser = async () => {
    try {
        const redirectUri = isNativeIosApp() ? NATIVE_IOS_REDIRECT_URI : undefined;

        const authUrl = await trpc.userData.getGoogleAuthUrl.query(redirectUri ? { redirectUri } : undefined);
        if (authUrl) {
            cacheSchedule();
            window.location.href = authUrl.toString();
        }
    } catch (error) {
        console.error('Error during login initiation', error);
        openSnackbar('error', 'Error during login initiation. Please Try Again.');
    }
};

export const deleteCourse = (sectionCode: string, term: string, scheduleIndex: number) => {
    AppStore.deleteCourse(sectionCode, term, scheduleIndex);
};

export const deleteCustomEvent = (customEventID: CustomEventId, scheduleIndices: number[]) => {
    AppStore.deleteCustomEvent(customEventID, scheduleIndices);
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
    if (event == null || (event.keyCode === 90 && (event.ctrlKey || event.metaKey) && !event.shiftKey)) {
        AppStore.undoAction();
    }
};

export const redoDelete = (event: KeyboardEvent | null) => {
    if (event == null || (event.keyCode === 90 && (event.ctrlKey || event.metaKey) && event.shiftKey)) {
        AppStore.redoAction();
    }
};

export const redoAction = () => {
    AppStore.redoAction();
};

export const changeCurrentSchedule = (newScheduleIndex: number) => {
    AppStore.changeCurrentSchedule(newScheduleIndex);
};

export const changeCustomEventColor = (customEventID: CustomEventId, newColor: string) => {
    AppStore.changeCustomEventColor(customEventID, newColor);
};

export const changeCourseColor = (sectionCode: string, term: string, newColor: string) => {
    AppStore.changeCourseColor(sectionCode, term, newColor);
};

export const copySchedule = (
    scheduleIndex: number,
    newScheduleName: string,
    options?: CopyScheduleOptions,
    postHog?: PostHog
) => {
    logAnalytics(postHog, {
        category: analyticsEnum.addedClasses,
        action: analyticsEnum.addedClasses.actions.COPY_SCHEDULE,
    });

    try {
        AppStore.copySchedule(scheduleIndex, newScheduleName);
        options?.onSuccess(newScheduleName);
    } catch {
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
