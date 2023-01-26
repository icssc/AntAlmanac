import {
    amber,
    blue,
    blueGrey,
    cyan,
    deepPurple,
    green,
    indigo,
    lightGreen,
    lime,
    pink,
    purple,
    red,
    teal,
} from '@material-ui/core/colors';
import { VariantType } from 'notistack';

import analyticsEnum, { logAnalytics } from '../analytics';
import { LOAD_DATA_ENDPOINT, SAVE_DATA_ENDPOINT } from '../api/endpoints';
import { SnackbarPosition } from '../components/AppBar/NotificationSnackbar';
import { RepeatingCustomEvent } from '../components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import { CourseDetails, courseNumAsDecimal, getCoursesData, termsInSchedule, warnMultipleTerms } from '../helpers';
import { Section } from '../peterportal.types';
import AppStore, { AppStoreCourse, ShortCourseInfo, UserData } from '../stores/AppStore';

const arrayOfColors = [
    red[500],
    pink[500],
    purple[500],
    indigo[500],
    deepPurple[500],
    blue[500],
    green[500],
    cyan[500],
    teal[500],
    lightGreen[500],
    lime[500],
    amber[500],
    blueGrey[500],
];

export const addCourse = (
    section: Section,
    courseDetails: CourseDetails,
    term: string,
    scheduleIndex: number,
    color?: string,
    quiet?: boolean
) => {
    logAnalytics({
        category: analyticsEnum.classSearch.title,
        action: analyticsEnum.classSearch.actions.ADD_COURSE,
        label: courseDetails.deptCode,
        value: courseNumAsDecimal(courseDetails.courseNumber),
    });
    const addedCourses = AppStore.getAddedCourses();
    const terms = termsInSchedule(addedCourses, term, scheduleIndex);
    let existingCourse;

    for (const course of addedCourses) {
        if (course.section.sectionCode === section.sectionCode && term === course.term) {
            existingCourse = course;
            if (course.scheduleIndices.includes(scheduleIndex)) {
                return course.color;
            } else {
                break;
            }
        }
    }

    if (terms.size > 1 && !quiet) warnMultipleTerms(terms);

    if (color === undefined) {
        const setOfUsedColors = new Set(addedCourses.map((course) => course.color));

        color = arrayOfColors.find((materialColor) => {
            if (!setOfUsedColors.has(materialColor)) return materialColor;
            else return undefined;
        });

        if (color === undefined) color = '#5ec8e0';
    }

    const scheduleNames = AppStore.getScheduleNames();
    if (existingCourse === undefined) {
        const newCourse: AppStoreCourse = {
            color: color,
            term: term,
            deptCode: courseDetails.deptCode,
            courseNumber: courseDetails.courseNumber,
            courseTitle: courseDetails.courseTitle,
            courseComment: courseDetails.courseComment,
            prerequisiteLink: courseDetails.prerequisiteLink,
            scheduleIndices: scheduleIndex === scheduleNames.length ? [...scheduleNames.keys()] : [scheduleIndex],
            section: { ...section, color: color },
        };
        AppStore.addCourse(newCourse);
    } else {
        const newSection = {
            ...existingCourse,
            scheduleIndices:
                scheduleIndex === scheduleNames.length
                    ? [...scheduleNames.keys()]
                    : existingCourse.scheduleIndices.concat(scheduleIndex),
        };
        AppStore.addSection(newSection);
    }
    return color;
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

            const addedCourses = AppStore.getAddedCourses();
            const customEvents = AppStore.getCustomEvents();
            const scheduleNames = AppStore.getScheduleNames();

            const userData = {
                addedCourses: [] as ShortCourseInfo[],
                scheduleNames: scheduleNames,
                customEvents: customEvents,
            };

            userData.addedCourses = addedCourses.map((course) => {
                return {
                    color: course.color,
                    term: course.term,
                    sectionCode: course.section.sectionCode,
                    scheduleIndices: course.scheduleIndices,
                };
            });

            try {
                await fetch(SAVE_DATA_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userID, userData }),
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
                const response_data = await fetch(LOAD_DATA_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userID: userID }),
                });
                if (response_data.status === 404) {
                    openSnackbar('error', `Couldn't find schedules for username "${userID}".`);
                    return;
                }
                const json = (await response_data.json()) as { userData: UserData };
                const courseData = await getCoursesData(json.userData);
                AppStore.loadSchedule(courseData);

                openSnackbar('success', `Schedule for username "${userID}" loaded.`);
            } catch (e) {
                console.error(e);
                openSnackbar('error', `Unknown error loading schedule for "${userID}".`);
            }
        }
    }
};

export const deleteCourse = (sectionCode: string, scheduleIndex: number, term: string) => {
    const addedCourses = AppStore.getAddedCourses();
    let deletedCourses = AppStore.getDeletedCourses();

    const addedCoursesAfterDelete = addedCourses.filter((course) => {
        if (course.section.sectionCode === sectionCode && course.term === term) {
            deletedCourses = deletedCourses.concat({
                ...course,
                scheduleIndex,
            });
            if (course.scheduleIndices.length === 1) {
                return false;
            } else {
                course.scheduleIndices = course.scheduleIndices.filter((index) => index !== scheduleIndex);

                return true;
            }
        }
        return true;
    });

    AppStore.deleteCourse(addedCoursesAfterDelete, deletedCourses);
};

export const deleteCustomEvent = (customEventID: number, scheduleIndex: number) => {
    const customEvents = AppStore.getCustomEvents();

    const customEventsAfterDelete = customEvents.filter((customEvent) => {
        if (customEvent.customEventID === customEventID) {
            if (customEvent.scheduleIndices.length === 1) {
                return false;
            } else {
                customEvent.scheduleIndices = customEvent.scheduleIndices.filter((index) => index !== scheduleIndex);

                return true;
            }
        }
        return true;
    });

    AppStore.deleteCustomEvent(customEventsAfterDelete);
};

export const editCustomEvent = (newCustomEvent: RepeatingCustomEvent) => {
    const customEventsAfterEdit = AppStore.getCustomEvents().map((customEvent) => {
        if (newCustomEvent.customEventID !== customEvent.customEventID) return customEvent;
        else return newCustomEvent;
    });
    AppStore.editCustomEvent(customEventsAfterEdit);
};

export const clearSchedules = (scheduleIndicesToClear: number[]) => {
    const addedCourses = AppStore.getAddedCourses();
    const customEvents = AppStore.getCustomEvents();
    const addedCoursesAfterClear = addedCourses.filter((course) => {
        course.scheduleIndices = course.scheduleIndices.filter((index) => !scheduleIndicesToClear.includes(index));
        return course.scheduleIndices.length !== 0;
    });

    const customEventsAfterClear = customEvents.filter((customEvent) => {
        customEvent.scheduleIndices = customEvent.scheduleIndices.filter(
            (index) => !scheduleIndicesToClear.includes(index)
        );
        return customEvent.scheduleIndices.length !== 0;
    });

    AppStore.clearSchedule(addedCoursesAfterClear, customEventsAfterClear);
};

export const addCustomEvent = (customEvent: RepeatingCustomEvent) => {
    AppStore.addCustomEvent(customEvent);
};

export const undoDelete = (event: KeyboardEvent | null) => {
    const deletedCourses = AppStore.getDeletedCourses();

    if (deletedCourses.length > 0 && (event == null || (event.keyCode === 90 && (event.ctrlKey || event.metaKey)))) {
        const lastDeleted = deletedCourses[deletedCourses.length - 1];

        if (lastDeleted !== undefined) {
            addCourse(lastDeleted.section, lastDeleted, lastDeleted.term, lastDeleted.scheduleIndex, lastDeleted.color);

            AppStore.undoDelete(deletedCourses.slice(0, deletedCourses.length - 1));

            openSnackbar(
                'success',
                `Undo delete ${lastDeleted.deptCode} ${lastDeleted.courseNumber} in schedule ${
                    lastDeleted.scheduleIndex + 1
                }.`
            );
        }
    }
};

export const changeCurrentSchedule = (newScheduleIndex: number) => {
    AppStore.changeCurrentSchedule(newScheduleIndex);
};

export const changeCustomEventColor = (customEventID: number, newColor: string) => {
    const customEvents = AppStore.getCustomEvents();

    const customEventsAfterColorChange = customEvents.map((customEvent) => {
        if (customEvent.customEventID === customEventID) {
            return { ...customEvent, color: newColor };
        } else {
            return customEvent;
        }
    });

    AppStore.changeCustomEventColor(customEventsAfterColorChange, customEventID, newColor);
};

export const changeCourseColor = (sectionCode: string, newColor: string, term: string) => {
    const addedCourses = AppStore.getAddedCourses();

    const addedCoursesAfterColorChange = addedCourses.map((addedCourse) => {
        if (addedCourse.section.sectionCode === sectionCode && addedCourse.term === term) {
            return { ...addedCourse, color: newColor };
        } else {
            return addedCourse;
        }
    });

    AppStore.changeCourseColor(addedCoursesAfterColorChange, sectionCode, newColor);
};

export const copySchedule = (from: number, to: number) => {
    const addedCourses = AppStore.getAddedCourses();
    const customEvents = AppStore.getCustomEvents();
    const scheduleNames = AppStore.getScheduleNames();

    const addedCoursesAfterCopy = addedCourses.map((addedCourse) => {
        if (addedCourse.scheduleIndices.includes(from) && !addedCourse.scheduleIndices.includes(to)) {
            // If to is equal to the length of scheduleNames, then the user wanted to copy to
            // all schedules; otherwise, if to is less than the length of scheduleNames, then
            // only one schedule should be altered
            if (to === scheduleNames.length) return { ...addedCourse, scheduleIndices: [...scheduleNames.keys()] };
            // this [...array.keys()] idiom is like list(range(len(array))) in python
            else
                return {
                    ...addedCourse,
                    scheduleIndices: addedCourse.scheduleIndices.concat(to),
                };
        } else {
            return addedCourse;
        }
    });

    const customEventsAfterCopy = customEvents.map((customEvent) => {
        if (customEvent.scheduleIndices.includes(from) && !customEvent.scheduleIndices.includes(to)) {
            if (to === scheduleNames.length) return { ...customEvent, scheduleIndices: [...scheduleNames.keys()] };
            else
                return {
                    ...customEvent,
                    scheduleIndices: customEvent.scheduleIndices.concat(to),
                };
        } else {
            return customEvent;
        }
    });

    logAnalytics({
        category: analyticsEnum.addedClasses.title,
        action: analyticsEnum.addedClasses.actions.COPY_SCHEDULE,
    });

    AppStore.copySchedule(addedCoursesAfterCopy, customEventsAfterCopy);
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
    const newScheduleNames = [...AppStore.getScheduleNames(), scheduleName];

    AppStore.addSchedule(newScheduleNames);
};

export const renameSchedule = (scheduleName: string, scheduleIndex: number) => {
    const newScheduleNames = [...AppStore.getScheduleNames()];
    newScheduleNames[scheduleIndex] = scheduleName;

    AppStore.renameSchedule(newScheduleNames);
};

// After a schedule is deleted, we need to update every course and
// custom event in every schedule. In this case, we want to update the
// scheduleIndices array so that each event appears in the correct schedule
const getEventsAfterDeleteSchedule = (events: (AppStoreCourse | RepeatingCustomEvent)[]) => {
    const newEvents = [] as typeof events;
    const currentScheduleIndex = AppStore.getCurrentScheduleIndex();

    events.forEach((event) => {
        const newScheduleIndices = [] as number[];

        event.scheduleIndices.forEach((index) => {
            if (index !== currentScheduleIndex) {
                // If a schedule gets deleted, all schedules after it are shifted back,
                // which means we sometimes need to subtract an index by 1
                newScheduleIndices.push(index > currentScheduleIndex ? index - 1 : index);
            }
        });

        if (newScheduleIndices.length > 0) {
            event.scheduleIndices = newScheduleIndices;
            newEvents.push(event);
        }
    });

    return newEvents;
};

export const deleteSchedule = (scheduleIndex: number) => {
    const newScheduleNames = [...AppStore.getScheduleNames()];
    newScheduleNames.splice(scheduleIndex, 1);

    let newScheduleIndex = AppStore.getCurrentScheduleIndex();
    if (newScheduleIndex === newScheduleNames.length) {
        newScheduleIndex--;
    }

    const newAddedCourses = getEventsAfterDeleteSchedule(AppStore.getAddedCourses()) as AppStoreCourse[];
    const newCustomEvents = getEventsAfterDeleteSchedule(AppStore.getCustomEvents()) as RepeatingCustomEvent[];

    AppStore.deleteSchedule(newScheduleNames, newAddedCourses, newCustomEvents, newScheduleIndex);
};
