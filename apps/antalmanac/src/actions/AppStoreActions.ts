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
import analyticsEnum, { logAnalytics, courseNumAsDecimal } from '$lib/analytics/analytics';
import trpc from '$lib/api/trpc';
import { warnMultipleTerms } from '$lib/helpers';
import { setLocalStorageUserId, setLocalStorageDataCache, removeLocalStorageSessionId } from '$lib/localStorage';
import AppStore from '$stores/AppStore';
import { scheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
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
export const saveSchedule = async (providerId: string, rememberMe: boolean) => {
    logAnalytics({
        category: analyticsEnum.nav.title,
        action: analyticsEnum.nav.actions.SAVE_SCHEDULE,
        label: providerId,
        value: rememberMe ? 1 : 0,
    });

    if (providerId != null) {
        providerId = providerId.replace(/\s+/g, '');

        if (providerId.length > 0) {
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
                await trpc.userData.saveUserData.mutate({
                    id: providerId,
                    data: {
                        id: providerId,
                        userData: scheduleSaveState,
                    },
                });

                if (useSessionStore.getState().sessionIsValid) {
                    openSnackbar('success', `Schedule saved. Don't forget to sign up for classes on WebReg!`);
                } else {
                    openSnackbar(
                        'success',
                        `Schedule saved under username "${providerId}". Don't forget to sign up for classes on WebReg!`
                    );
                }
                AppStore.saveSchedule();
            } catch (e) {
                if (e instanceof TRPCError) {
                    if (useSessionStore.getState().sessionIsValid) {
                        openSnackbar('error', `Schedule could not be saved`);
                    } else {
                        openSnackbar('error', `Schedule could not be saved under username "${providerId}`);
                    }
                } else {
                    openSnackbar('error', 'Network error or server is down.');
                }
            }
        }
    }
};

export async function autoSaveSchedule(providerID: string) {
    logAnalytics({
        category: analyticsEnum.nav.title,
        action: analyticsEnum.nav.actions.SAVE_SCHEDULE,
        label: providerID,
    });
    if (providerID == null) return;
    providerID = providerID.replace(/\s+/g, '');
    if (providerID.length < 0) return;

    const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();
    try {
        await trpc.userData.saveUserData.mutate({
            id: providerID,
            data: {
                id: providerID,
                userData: scheduleSaveState,
            },
        });

        AppStore.saveSchedule();
    } catch (e) {
        if (e instanceof TRPCError) {
            openSnackbar('error', `Schedule could not be auto-saved under username "${providerID}`);
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
    const session = useSessionStore.getState();
    if (!session.sessionIsValid) {
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

    const accounts = await trpc.userData.getUserAndAccountBySessionToken
        .query({ token: session.session ?? '' })
        .then((res) => res.accounts);

    const incomingData: User = await trpc.userData.getUserData.query({ userId: incomingUser.id });
    const scheduleSaveState = 'userData' in incomingData ? incomingData.userData : incomingData;

    const currentSchedules = AppStore.schedule.getScheduleAsSaveState();

    if (scheduleSaveState.schedules) {
        mergeShortCourseSchedules(currentSchedules.schedules, scheduleSaveState.schedules, '(import)-');
        currentSchedules.scheduleIndex = currentSchedules.schedules.length - 1;

        scheduleComponentsToggleStore.setState({ openImportDialog: false, openLoadingSchedule: true });

        const isScheduleLoaded = await AppStore.loadSchedule(currentSchedules);
        if (isScheduleLoaded) {
            openSnackbar('success', `Schedule with name "${username}" imported successfully!`);

            scheduleComponentsToggleStore.setState({ openScheduleSelect: true, openLoadingSchedule: false });

            await saveSchedule(accounts.providerAccountId, true);

            await trpc.userData.flagImportedSchedule.mutate({
                providerId: username,
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

export const loadSchedule = async (providerId: string, rememberMe: boolean, accountType: 'GOOGLE' | 'GUEST') => {
    logAnalytics({
        category: analyticsEnum.nav.title,
        action: analyticsEnum.nav.actions.LOAD_SCHEDULE,
        label: providerId,
        value: rememberMe ? 1 : 0,
    });
    if (
        providerId != null &&
        (!AppStore.hasUnsavedChanges() ||
            window.confirm(`Are you sure you want to load a different schedule? You have unsaved changes!`))
    ) {
        providerId = providerId.replace(/\s+/g, '');
        if (providerId.length > 0) {
            if (rememberMe) {
                setLocalStorageUserId(providerId);
            }

            try {
                const account = await trpc.userData.getAccountByProviderId.query({
                    accountType,
                    providerId,
                });

                const userDataResponse = await trpc.userData.getUserData.query({ userId: account.userId });
                const scheduleSaveState = userDataResponse?.userData ?? userDataResponse;

                if (await AppStore.loadSchedule(scheduleSaveState)) {
                    openSnackbar('success', `Schedule loaded.`);
                } else {
                    AppStore.loadSkeletonSchedule(scheduleSaveState);
                    openSnackbar(
                        'error',
                        `Network error loading course information for "${providerId}". 	              
                        If this continues to happen, please submit a feedback form.`
                    );
                }
            } catch (e) {
                if (e instanceof Error) {
                    openSnackbar('error', e.message);
                } else {
                    openSnackbar(
                        'error',
                        '`Failed to load schedules. If this continues to happen, please submit a feedback form.`'
                    );
                }
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
            refreshToken: useSessionStore.getState().session ?? '',
        });
        const scheduleSaveState = userDataResponse?.userData ?? userDataResponse;
        if (isEmptySchedule(scheduleSaveState.schedules)) {
            return true;
        }

        if (scheduleSaveState == null) {
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
        console.error(e);
        openSnackbar('error', `Failed to load schedules. If this continues to happen, please submit a feedback form.`);
        removeLocalStorageSessionId();
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
        const authUrl = await trpc.userData.getGoogleAuthUrl.query();
        if (authUrl) {
            cacheSchedule();
            window.location.href = authUrl;
        }
    } catch (error) {
        console.error('Error during login initiation', error);
        openSnackbar('error', 'Error during login initiation. Please Try Again.');
    }
};

export const deleteCourse = (sectionCode: string, term: string, scheduleIndex: number) => {
    AppStore.deleteCourse(sectionCode, term, scheduleIndex);
};

export const deleteCustomEvent = (customEventID: number, scheduleIndices: number[]) => {
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
