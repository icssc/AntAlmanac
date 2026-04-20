import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import trpc from '$lib/api/trpc';
import { getSignInUrl } from '$lib/auth/authActions';
import { warnMultipleTerms } from '$lib/helpers';
import { setLocalStorageDataCache, setLocalStorageUserId } from '$lib/localStorage';
import AppStore from '$stores/AppStore';
import { deleteTempSaveData } from '$stores/localTempSaveDataHelpers';
import { useScheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import type {
    CourseDetails,
    CustomEventId,
    RepeatingCustomEvent,
    ScheduleCourse,
    ShortCourseSchedule,
    User,
    WebsocSection,
} from '@packages/antalmanac-types';
import { TRPCClientError } from '@trpc/client';
import { TRPCError } from '@trpc/server';
import { PostHog } from 'posthog-js/react';

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

export const saveSchedule = async (userId: string, rememberMe: boolean, postHog?: PostHog) => {
    logAnalytics(postHog, {
        category: analyticsEnum.nav,
        action: analyticsEnum.nav.actions.SAVE_SCHEDULE,
        label: userId,
        value: rememberMe ? 1 : 0,
    });

    if (userId != null) {
        userId = userId.replace(/\s+/g, '');

        if (userId.length > 0) {
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
                    id: userId,
                    data: {
                        id: userId,
                        userData: scheduleSaveState,
                    },
                });

                if (result?.scheduleIdMap) {
                    AppStore.schedule.updateScheduleIds(result.scheduleIdMap);
                }

                if (useSessionStore.getState().sessionIsValid) {
                    openSnackbar('success', `Schedule saved. Don't forget to sign up for classes on WebReg!`);
                } else {
                    openSnackbar(
                        'success',
                        `Schedule saved under username "${userId}". Don't forget to sign up for classes on WebReg!`
                    );
                }
                deleteTempSaveData();
                AppStore.saveSchedule();
            } catch (e) {
                if (e instanceof TRPCError) {
                    if (useSessionStore.getState().sessionIsValid) {
                        openSnackbar('error', `Schedule could not be saved`);
                    } else {
                        openSnackbar('error', `Schedule could not be saved under username "${userId}"`);
                    }
                } else {
                    openSnackbar('error', 'Network error or server is down.');
                }
            }
        }
    }
};

export async function autoSaveSchedule(userId: string, { postHog }: AutoSaveScheduleOptions = {}) {
    logAnalytics(postHog, {
        category: analyticsEnum.nav,
        action: analyticsEnum.nav.actions.SAVE_SCHEDULE,
        label: userId,
    });
    if (userId == null) return;
    userId = userId.replace(/\s+/g, '');
    if (userId.length === 0) return;

    const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();
    try {
        const result = await trpc.userData.saveUserData.mutate({
            id: userId,
            data: {
                id: userId,
                userData: scheduleSaveState,
            },
        });

        if (result?.scheduleIdMap) {
            AppStore.schedule.updateScheduleIds(result.scheduleIdMap);
        }

        deleteTempSaveData();
        AppStore.saveSchedule();
    } catch (e) {
        if (e instanceof TRPCError) {
            openSnackbar('error', `Schedule could not be auto-saved under username "${userId}"`);
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
        let scheduleName = schedule.scheduleName;
        if (existingScheduleNames.has(schedule.scheduleName)) {
            scheduleName = scheduleName + '(1)';
        }
        return {
            ...schedule,
            scheduleName: `${importMessage}${scheduleName}`,
        };
    });
    currentSchedules.push(...cacheSchedule);
};

const handleScheduleImport = async (username: string, skipImportedCheck = false) => {
    const sessionStore = useSessionStore.getState();
    if (!sessionStore.sessionIsValid || !sessionStore.session) {
        throw new Error("Invalid session: User isn't logged in.");
    }

    const incomingUser = await trpc.userData.getGuestAccountAndUserByName
        .query({ name: username })
        .then((res) => res?.users)
        .catch(() => {
            throw new Error(`Oops! Schedule "${username}" doesn't seem to exist.`);
        });

    if (!skipImportedCheck && incomingUser.imported) {
        return { imported: true, error: null };
    }

    const userAndAccount = await trpc.userData.getUserAndAccountBySessionToken.query({
        token: sessionStore.session.token ?? '',
    });
    const { accounts } = userAndAccount;

    const incomingData: User | null = await trpc.userData.getUserData.query({ userId: incomingUser.id });
    const scheduleSaveState =
        incomingData !== null && 'userData' in incomingData ? incomingData.userData : incomingData;

    const currentSchedules = AppStore.schedule.getScheduleAsSaveState();

    if (scheduleSaveState?.schedules) {
        mergeShortCourseSchedules(currentSchedules.schedules, scheduleSaveState.schedules, '(import)-');
        currentSchedules.scheduleIndex = currentSchedules.schedules.length - 1;

        useScheduleComponentsToggleStore.setState({ openImportDialog: false, openLoadingSchedule: true });

        const isScheduleLoaded = await AppStore.loadSchedule(currentSchedules);
        if (isScheduleLoaded) {
            openSnackbar('success', `Schedule with name "${username}" imported successfully!`);

            useScheduleComponentsToggleStore.setState({ openScheduleSelect: true, openLoadingSchedule: false });

            await saveSchedule(accounts.providerAccountId, true);

            await trpc.userData.flagImportedSchedule.mutate({
                providerAccountId: username,
            });
        }
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

export const loadSchedule = async (
    providerAccountId: string,
    rememberMe: boolean,
    accountType: 'OIDC' | 'GOOGLE' | 'GUEST',
    postHog?: PostHog
) => {
    logAnalytics(postHog, {
        category: analyticsEnum.nav,
        action: analyticsEnum.nav.actions.LOAD_SCHEDULE,
        label: providerAccountId,
        value: rememberMe ? 1 : 0,
    });
    if (
        providerAccountId != null &&
        (!AppStore.hasUnsavedChanges() ||
            window.confirm(`Are you sure you want to load a different schedule? You have unsaved changes!`))
    ) {
        providerAccountId = providerAccountId.replace(/\s+/g, '');
        if (providerAccountId.length > 0) {
            if (rememberMe) {
                setLocalStorageUserId(providerAccountId);
            }

            try {
                const account = await trpc.userData.getAccountByProviderAccountId.query({
                    accountType,
                    providerAccountId: providerAccountId,
                });

                const userDataResponse = await trpc.userData.getUserData.query({ userId: account.userId });
                const scheduleSaveState = userDataResponse?.userData;

                let error = false;

                if (scheduleSaveState) {
                    if (await AppStore.loadSchedule(scheduleSaveState)) {
                        openSnackbar('success', `Schedule loaded.`);
                    } else {
                        AppStore.loadSkeletonSchedule(scheduleSaveState);
                        error = true;
                    }
                } else {
                    error = true;
                }

                if (error) {
                    openSnackbar(
                        'error',
                        `Network error loading course information for "${providerAccountId}". 	              
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
                    '`Failed to load schedules. If this continues to happen, please submit a feedback form.`'
                );
            }
        }
    }
};

export const loadScheduleWithSessionToken = async () => {
    // logAnalytics({
    //     category: analyticsEnum.nav.title,
    //     action: analyticsEnum.nav.actions.LOAD_SCHEDULE,
    //     label: providerId,
    //     value: rememberMe ? 1 : 0,
    // });
    try {
        const userDataResponse = await trpc.userData.getUserDataWithSession.query({
            refreshToken: useSessionStore.getState().session?.token ?? '',
        });
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
        console.error('Error in loadScheduleWithSessionToken:', e);
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

/**
 * If `signInUrl` is not provided, {@link getSignInUrl} with default params will be used.
 */
export const loginUser = async ({ silent = false, signInUrl = '' } = {}) => {
    try {
        const url = signInUrl !== '' ? signInUrl : (await getSignInUrl()).url;
        if (url) {
            cacheSchedule();
            window.location.href = url.toString();
        }
    } catch (error) {
        if (!silent) {
            console.error('Error during login initiation', error);
            openSnackbar('error', 'Error during login initiation. Please Try Again.');
        }
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
