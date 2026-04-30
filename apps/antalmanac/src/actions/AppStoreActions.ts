import analyticsEnum, { analyticsIdentifyUser, logAnalytics } from '$lib/analytics/analytics';
import trpc from '$lib/api/trpc';
import { warnMultipleTerms } from '$lib/helpers';
import { setLocalStorageUserId, setLocalStorageDataCache } from '$lib/localStorage';
import { isNativeIosApp, NATIVE_IOS_REDIRECT_URI } from '$lib/platform';
import { getErrorMessage } from '$lib/utils';
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
        customProps: {
            courseDept: courseDetails.deptCode,
            courseNumber: courseDetails.courseNumber,
        },
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

export const saveSchedule = async ({ postHog }: { postHog?: PostHog }) => {
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
        logAnalytics(postHog, {
            category: analyticsEnum.auth,
            action: analyticsEnum.auth.actions.SAVE_SCHEDULE,
            customProps: {
                autoSave: false,
            },
        });
        AppStore.saveSchedule();
    } catch (e) {
        if (e instanceof TRPCClientError) {
            openSnackbar('error', `Schedule could not be saved`);
        } else {
            openSnackbar('error', 'Network error or server is down.');
        }
        logAnalytics(postHog, {
            category: analyticsEnum.auth,
            action: analyticsEnum.auth.actions.SAVE_SCHEDULE_FAIL,
            error: getErrorMessage(e),
            customProps: {
                autoSave: false,
            },
        });
    }
};

export async function autoSaveSchedule(options: AutoSaveScheduleOptions) {
    const { postHog } = options;

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
        logAnalytics(postHog, {
            category: analyticsEnum.auth,
            action: analyticsEnum.auth.actions.SAVE_SCHEDULE,
            customProps: {
                autoSave: true,
            },
        });
    } catch (e) {
        if (e instanceof TRPCClientError) {
            openSnackbar('error', 'Schedule could not be auto-saved');
        } else {
            openSnackbar('error', 'Network error or server is down.');
        }
        logAnalytics(postHog, {
            category: analyticsEnum.auth,
            action: analyticsEnum.auth.actions.SAVE_SCHEDULE_FAIL,
            error: getErrorMessage(e),
            customProps: {
                autoSave: true,
            },
        });
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
            scheduleName = `${scheduleName}(1)`;
        }
        return {
            ...schedule,
            scheduleName: `${importMessage}${scheduleName}`,
        };
    });
    currentSchedules.push(...cacheSchedule);
};

const handleScheduleImport = async (username: string, skipImportedCheck = false, postHog?: PostHog) => {
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
        mergeShortCourseSchedules(currentSchedules.schedules, scheduleSaveState.schedules, '(import)-');
        currentSchedules.scheduleIndex = currentSchedules.schedules.length - 1;

        scheduleComponentsToggleStore.setState({
            openImportDialog: false,
            openLoadingSchedule: true,
        });

        const isScheduleLoaded = await AppStore.loadSchedule(currentSchedules);
        if (isScheduleLoaded) {
            logAnalytics(postHog, {
                category: analyticsEnum.nav,
                action: analyticsEnum.nav.actions.IMPORT_LEGACY,
            });

            openSnackbar('success', `Schedule with name "${username}" imported successfully!`);

            scheduleComponentsToggleStore.setState({
                openScheduleSelect: true,
                openLoadingSchedule: false,
            });

            await saveSchedule({ postHog });

            await trpc.userData.flagImportedSchedule.mutate({
                username,
            });
        }
    }

    return { imported: false, error: null };
};

export const importValidatedSchedule = async (username: string, postHog?: PostHog) => {
    try {
        return await handleScheduleImport(username, true, postHog);
    } catch (e) {
        return { imported: false, error: e };
    }
};

export const importScheduleWithUsername = async (username: string, postHog?: PostHog) => {
    try {
        return await handleScheduleImport(username, false, postHog);
    } catch (e) {
        return { imported: false, error: e };
    }
};

export const loadGuestSchedule = async (username: string, rememberMe: boolean, postHog?: PostHog) => {
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
                    logAnalytics(postHog, {
                        category: analyticsEnum.auth,
                        action: analyticsEnum.auth.actions.LOAD_SCHEDULE_LEGACY_FAIL,
                        error: 'Load schedule error',
                        customProps: { providerId: username, rememberMe },
                    });
                    openSnackbar(
                        'error',
                        `Network error loading course information for "${username}". 	              
                        If this continues to happen, please submit a feedback form.`
                    );
                } else {
                    logAnalytics(postHog, {
                        category: analyticsEnum.auth,
                        action: analyticsEnum.auth.actions.LOAD_SCHEDULE_LEGACY,
                        customProps: { providerId: username, rememberMe },
                    });
                }
            } catch (e) {
                logAnalytics(postHog, {
                    category: analyticsEnum.auth,
                    action: analyticsEnum.auth.actions.LOAD_SCHEDULE_LEGACY_FAIL,
                    error: getErrorMessage(e),
                    customProps: { providerId: username, rememberMe },
                });
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

interface LoadScheduleOptions {
    prefetched: Awaited<ReturnType<typeof trpc.userData.getUserData.query>> | null;
    postHog?: PostHog;
}

export const loadSchedule = async ({ prefetched, postHog }: LoadScheduleOptions) => {
    try {
        const userDataResponse = prefetched ?? (await trpc.userData.getUserData.query());
        const scheduleSaveState = userDataResponse?.userData;
        const userId = userDataResponse?.id;
        let analyticsErrorMessage = '';

        if (scheduleSaveState !== undefined && isEmptySchedule(scheduleSaveState.schedules)) {
            analyticsIdentifyUser(postHog, userId);
            logAnalytics(postHog, {
                category: analyticsEnum.auth,
                action: analyticsEnum.auth.actions.LOAD_SCHEDULE,
            });
            return true;
        }

        if (scheduleSaveState === undefined) {
            analyticsErrorMessage = 'Schedule data not found';
            openSnackbar('error', `Couldn't find schedules for this account`);
        } else if (await AppStore.loadSchedule(scheduleSaveState)) {
            analyticsIdentifyUser(postHog, userId);
            openSnackbar('success', `Schedule loaded.`);
            logAnalytics(postHog, {
                category: analyticsEnum.auth,
                action: analyticsEnum.auth.actions.LOAD_SCHEDULE,
            });
            return true;
        } else {
            analyticsErrorMessage = 'Network error';
            AppStore.loadSkeletonSchedule(scheduleSaveState);
            openSnackbar(
                'error',
                `Network error loading course information". 	              
                        If this continues to happen, please submit a feedback form.`
            );
        }
        logAnalytics(postHog, {
            category: analyticsEnum.auth,
            action: analyticsEnum.auth.actions.LOAD_SCHEDULE_FAIL,
            error: analyticsErrorMessage,
        });
        return false;
    } catch (e) {
        logAnalytics(postHog, {
            category: analyticsEnum.auth,
            action: analyticsEnum.auth.actions.LOAD_SCHEDULE_FAIL,
            error: getErrorMessage(e),
        });
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

export const loginUser = async (postHog?: PostHog) => {
    try {
        const redirectUri = isNativeIosApp() ? NATIVE_IOS_REDIRECT_URI : undefined;

        const authUrl = await trpc.userData.getGoogleAuthUrl.query(redirectUri ? { redirectUri } : undefined);
        if (authUrl) {
            logAnalytics(postHog, {
                category: analyticsEnum.auth,
                action: analyticsEnum.auth.actions.SIGN_IN,
            });
            cacheSchedule();
            window.location.href = authUrl.toString();
        }
    } catch (error) {
        logAnalytics(postHog, {
            category: analyticsEnum.auth,
            action: analyticsEnum.auth.actions.SIGN_IN_FAIL,
            error: getErrorMessage(error),
        });
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
