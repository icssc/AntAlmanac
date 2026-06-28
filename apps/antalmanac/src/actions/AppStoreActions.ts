import analyticsEnum, { analyticsIdentifyUser, logAnalytics } from '$lib/analytics/analytics';
import { trpc } from '$lib/api/trpc';
import { getSignInUrl } from '$lib/auth/authActions';
import { Provider } from '$lib/auth/authTypes';
import { warnMultipleTerms } from '$lib/helpers';
import { setLocalStorageDataCache, setLocalStorageUserId } from '$lib/localStorage';
import { getErrorMessage } from '$lib/utils';
import AppStore from '$stores/AppStore';
import { useHiddenCoursesStore } from '$stores/HiddenCoursesStore';
import { deleteTempSaveData } from '$stores/localTempSaveDataHelpers';
import { useScheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import {
    type AACourseWithTerm,
    type AASection,
    type AATerm,
    type CustomEventId,
    type RepeatingCustomEvent,
    type ShortCourseSchedule,
} from '@packages/antalmanac-types';
import { TRPCClientError } from '@trpc/client';
import type { PostHog } from 'posthog-js/react';

export type UserData = Awaited<ReturnType<typeof trpc.schedule.get.query>>;

interface CopyScheduleOptions {
    onSuccess: (scheduleName: string) => unknown;
    onError: (scheduleName: string) => unknown;
}

interface AutoSaveScheduleOptions {
    postHog?: PostHog;
}

interface LoadScheduleOptions {
    prefetched: UserData | null;
    postHog?: PostHog;
}

interface LoginUserOptions {
    silent?: boolean;
    postHog?: PostHog;
}

export const addCourse = (
    section: AASection,
    course: AACourseWithTerm,
    scheduleIndex: number,
    quiet?: boolean,
    postHog?: PostHog
) => {
    logAnalytics(postHog, {
        category: analyticsEnum.classSearch,
        action: analyticsEnum.classSearch.actions.ADD_COURSE,
        customProps: {
            courseDept: course.deptCode,
            courseNumber: course.courseNumber,
        },
    });
    const terms = AppStore.termsInSchedule(course.term);

    if (terms.size > 1 && !quiet) warnMultipleTerms(terms);

    AppStore.addCourse(section, course, scheduleIndex);
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

function enrichSaveStateWithVisibility(saveState: ReturnType<typeof AppStore.schedule.getScheduleAsSaveState>) {
    const { getVisibility } = useHiddenCoursesStore.getState();
    return {
        ...saveState,
        schedules: saveState.schedules.map((schedule) => ({
            ...schedule,
            courses: schedule.courses.map((course) => ({
                ...course,
                visibility: getVisibility(schedule.id!, course.term, course.sectionCode),
            })),
        })),
    };
}

const saveSchedule = async ({ postHog }: { postHog?: PostHog }) => {
    const scheduleSaveState = enrichSaveStateWithVisibility(AppStore.schedule.getScheduleAsSaveState());

    if (
        isEmptySchedule(scheduleSaveState.schedules) &&
        !confirm(
            "You are attempting to save empty schedule(s). If this is unintentional, this may overwrite your existing schedules that haven't loaded yet!"
        )
    ) {
        return;
    }

    try {
        const result = await trpc.schedule.save.mutate({
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

export async function autoSaveSchedule({ postHog }: AutoSaveScheduleOptions) {
    const scheduleSaveState = enrichSaveStateWithVisibility(AppStore.schedule.getScheduleAsSaveState());
    try {
        const result = await trpc.schedule.save.mutate({
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
    const sessionStore = useSessionStore.getState();
    if (!sessionStore.sessionIsValid) {
        throw new Error("Invalid session: User isn't logged in.");
    }

    const incoming = await trpc.schedule.getGuest.query({ username }).catch(() => {
        throw new Error(`Oops! Schedule "${username}" doesn't seem to exist.`);
    });

    if (!skipImportedCheck && incoming.imported) {
        return { imported: true, error: null };
    }

    const scheduleSaveState = incoming.userData;

    const currentSchedules = AppStore.schedule.getScheduleAsSaveState();

    if (scheduleSaveState?.schedules) {
        mergeShortCourseSchedules(currentSchedules.schedules, scheduleSaveState.schedules, '(import)-');
        currentSchedules.scheduleIndex = currentSchedules.schedules.length - 1;

        useScheduleComponentsToggleStore.setState({
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

            useScheduleComponentsToggleStore.setState({
                openScheduleSelect: true,
                openLoadingSchedule: false,
            });

            await saveSchedule({ postHog });

            await trpc.schedule.flagImported.mutate({
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
                const result = await trpc.schedule.getGuest.query({ username });
                const scheduleSaveState = result.userData;

                if (await AppStore.loadSchedule(scheduleSaveState)) {
                    logAnalytics(postHog, {
                        category: analyticsEnum.auth,
                        action: analyticsEnum.auth.actions.LOAD_SCHEDULE_LEGACY,
                        customProps: { providerId: username, rememberMe },
                    });
                } else {
                    AppStore.loadFallbackSchedule(scheduleSaveState);
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

export const loadSchedule = async ({ prefetched, postHog }: LoadScheduleOptions) => {
    try {
        const userDataResponse = prefetched ?? (await trpc.schedule.get.query());
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
            useHiddenCoursesStore.getState().hydrateFromSchedules(scheduleSaveState.schedules);
            analyticsIdentifyUser(postHog, userId);
            logAnalytics(postHog, {
                category: analyticsEnum.auth,
                action: analyticsEnum.auth.actions.LOAD_SCHEDULE,
            });
            return true;
        } else {
            analyticsErrorMessage = 'Network error';
            AppStore.loadFallbackSchedule(scheduleSaveState);
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

/**
 * @param options.silent Sign in silently with `prompt: none` and suppress errors?
 */
export const loginUser = async (provider: Provider, { silent = false, postHog }: LoginUserOptions = {}) => {
    try {
        const authUrl = await getSignInUrl(provider, {
            authorizationUrlParams: silent ? { prompt: 'none' } : undefined,
            returnUrl: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        });

        logAnalytics(postHog, {
            category: analyticsEnum.auth,
            action: analyticsEnum.auth.actions.SIGN_IN,
        });
        cacheSchedule();
        window.location.href = authUrl;
    } catch (error) {
        logAnalytics(postHog, {
            category: analyticsEnum.auth,
            action: analyticsEnum.auth.actions.SIGN_IN_FAIL,
            error: getErrorMessage(error),
        });
        if (!silent) {
            console.error('Error during login initiation', error);
            openSnackbar('error', 'Error during login initiation. Please Try Again.');
        }
    }
};

export const deleteCourse = (sectionCode: string, term: AATerm, scheduleIndex: number) => {
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
    if (event != null && shouldIgnoreShortcutTarget(event.target)) {
        return;
    }

    if (event == null || (event.key === 'z' && (event.ctrlKey || event.metaKey) && !event.shiftKey)) {
        AppStore.undoAction();
    }
};

export const redoDelete = (event: KeyboardEvent | null) => {
    if (event != null && shouldIgnoreShortcutTarget(event.target)) {
        return;
    }

    if (event == null || (event.key.toLowerCase() === 'z' && (event.ctrlKey || event.metaKey) && event.shiftKey)) {
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

export const changeCourseColor = (sectionCode: string, term: AATerm, newColor: string) => {
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
