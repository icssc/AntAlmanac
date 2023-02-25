import { VariantType } from 'notistack';

import { SnackbarPosition } from '$components/AppBar/NotificationSnackbar';
import { RepeatingCustomEvent } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { LOAD_DATA_ENDPOINT, LOAD_LEGACY_DATA_ENDPOINT, SAVE_DATA_ENDPOINT } from '$lib/api/endpoints';
import { CourseDetails, courseNumAsDecimal, termsInSchedule, warnMultipleTerms } from '$lib/helpers';
import { Section } from '$lib/peterportal.types';
import AppStore from '$stores/AppStore';
import { convertLegacySchedule, LegacyUserData } from '$stores/legacyScheduleHelpers';
import { ScheduleCourse, ScheduleSaveState } from '$stores/schedule.types';

export const addCourse = (
    section: Section,
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
    const terms = termsInSchedule(term);

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
                window.localStorage.setItem('userID', userID);
            } else {
                window.localStorage.removeItem('userID');
            }

            const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();

            try {
                await fetch(SAVE_DATA_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userID, userData: scheduleSaveState }),
                });

                openSnackbar(
                    'success',
                    `Schedule saved under username "${userID}". Don't forget to sign up for classes on WebReg!`
                );
                AppStore.saveSchedule();
            } catch (e) {
                openSnackbar('error', `Schedule could not be saved under username "${userID}`);
            }
        }
    }
};

export const loadSchedule = async (userID: string, rememberMe: boolean) => {
    logAnalytics({
        category: analyticsEnum.nav.title,
        action: analyticsEnum.nav.actions.LOAD_SCHEDULE,
        label: userID,
        value: rememberMe ? 1 : 0,
    });
    if (
        userID != null &&
        (!AppStore.hasUnsavedChanges() ||
            window.confirm(`Are you sure you want to load a different schedule? You have unsaved changes!`))
    ) {
        userID = userID.replace(/\s+/g, '');

        if (userID.length > 0) {
            if (rememberMe) {
                window.localStorage.setItem('userID', userID);
            } else {
                window.localStorage.removeItem('userID');
            }

            try {
                let scheduleSaveState: unknown; // Unknown because we cast this as two conflicting types
                let response_data = await fetch(LOAD_DATA_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userID: userID }),
                });

                if (response_data.ok) {
                    const json = (await response_data.json()) as { userData: ScheduleSaveState };
                    scheduleSaveState = json.userData;

                    if (scheduleSaveState !== undefined) {
                        // First we will try loading the schedule normally
                        if (await AppStore.loadSchedule(scheduleSaveState as ScheduleSaveState)) {
                            openSnackbar('success', `Schedule for username "${userID}" loaded.`);
                            return;
                        }
                        // Second we try loading the schedule as if it was legacy
                        // in case a legacy schedule was somehow saved to the new DB
                        else if (
                            await AppStore.loadSchedule(convertLegacySchedule(scheduleSaveState as LegacyUserData))
                        ) {
                            openSnackbar('success', `Schedule for username "${userID}" loaded.`);
                            return;
                        }
                    }
                }

                // Finally try getting and loading from legacy if none of the above works
                response_data = await fetch(LOAD_LEGACY_DATA_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userID: userID }),
                });
                if (response_data.ok) {
                    const json = (await response_data.json()) as { userData: LegacyUserData };
                    const legacyUserData = json.userData;
                    if (legacyUserData !== undefined) {
                        if (await AppStore.loadSchedule(convertLegacySchedule(legacyUserData))) {
                            openSnackbar('success', `Legacy schedule for username "${userID}" loaded.`);
                            return;
                        }
                    }
                }

                // If none of the above works
                openSnackbar('error', `Couldn't find schedules for username "${userID}".`);
            } catch (e) {
                openSnackbar('error', `Got a network error when trying to load schedules.`);
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

export const deleteSchedule = () => {
    AppStore.deleteSchedule();
};