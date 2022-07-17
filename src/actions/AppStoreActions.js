import dispatcher from '../dispatcher';
import AppStore from '../stores/AppStore';
import ReactGA from 'react-ga';
import analyticsEnum, { logAnalytics } from '../analytics';
import { courseNumAsDecimal } from '../helpers';
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
import { getCoursesData, termsInSchedule, warnMultipleTerms } from '../helpers';
import { LOAD_DATA_ENDPOINT, SAVE_DATA_ENDPOINT } from '../api/endpoints';

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

export const addCourse = (section, courseDetails, term, scheduleIndex, color, quiet) => {
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
                return;
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
        const newCourse = {
            color: color,
            term: term,
            deptCode: courseDetails.deptCode,
            courseNumber: courseDetails.courseNumber,
            courseTitle: courseDetails.courseTitle,
            courseComment: courseDetails.courseComment,
            prerequisiteLink: courseDetails.prerequisiteLink,
            scheduleIndices:
                scheduleIndex === scheduleNames.length ? scheduleNames.map((_, index) => index) : [scheduleIndex],
            section: section,
        };
        dispatcher.dispatch({ type: 'ADD_COURSE', newCourse });
    } else {
        const newSection = {
            ...existingCourse,
            scheduleIndices:
                scheduleIndex === scheduleNames.length
                    ? scheduleNames.map((_, index) => index)
                    : existingCourse.scheduleIndices.concat(scheduleIndex),
        };
        dispatcher.dispatch({ type: 'ADD_SECTION', newSection });
    }
    return color;
};
/**
 * @param variant usually 'info', 'error', 'warning', or 'success'
 * @param message any string to display
 * @param duration in seconds and is optional.
 */
export const openSnackbar = (variant, message, duration, position, style) => {
    dispatcher.dispatch({
        type: 'OPEN_SNACKBAR',
        variant: variant,
        message: message,
        duration: duration,
        position: position,
        style: style,
    });
};

export const saveSchedule = async (userID, rememberMe) => {
    logAnalytics({
        category: analyticsEnum.nav.title,
        action: analyticsEnum.nav.actions.SAVE_SCHEDULE,
        label: userID,
        value: rememberMe,
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

            const userData = { addedCourses: [], scheduleNames: scheduleNames, customEvents: customEvents };

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

                dispatcher.dispatch({
                    type: 'SAVE_SCHEDULE',
                });
            } catch (e) {
                openSnackbar('error', `Schedule could not be saved under username "${userID}`);
            }
        }
    }
};

export const loadSchedule = async (userID, rememberMe) => {
    logAnalytics({
        category: analyticsEnum.nav.title,
        action: analyticsEnum.nav.actions.LOAD_SCHEDULE,
        label: userID,
        value: rememberMe,
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
                const data = await fetch(LOAD_DATA_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userID: userID }),
                });

                const json = await data.json();

                dispatcher.dispatch({
                    type: 'LOAD_SCHEDULE',
                    userData: await getCoursesData(json.userData),
                });
                openSnackbar('success', `Schedule for username "${userID}" loaded.`);
            } catch (e) {
                openSnackbar('error', `Couldn't find schedules for username "${userID}".`);
            }
        }
    }
};

export const deleteCourse = (sectionCode, scheduleIndex, term) => {
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

    dispatcher.dispatch({
        type: 'DELETE_COURSE',
        addedCoursesAfterDelete,
        deletedCourses,
    });
};

export const deleteCustomEvent = (customEventID, scheduleIndex) => {
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

    dispatcher.dispatch({
        type: 'DELETE_CUSTOM_EVENT',
        customEventsAfterDelete,
    });
};

export const editCustomEvent = (newCustomEvent) => {
    const customEventsAfterEdit = AppStore.getCustomEvents().map((customEvent) => {
        if (newCustomEvent.customEventID !== customEvent.customEventID) return customEvent;
        else return newCustomEvent;
    });
    dispatcher.dispatch({ type: 'EDIT_CUSTOM_EVENTS', customEventsAfterEdit });
};

export const clearSchedules = (scheduleIndicesToClear) => {
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

    dispatcher.dispatch({
        type: 'CLEAR_SCHEDULE',
        addedCoursesAfterClear,
        customEventsAfterClear,
    });
};

export const addCustomEvent = (customEvent) => {
    dispatcher.dispatch({ type: 'ADD_CUSTOM_EVENT', customEvent });
};

export const undoDelete = (event) => {
    const deletedCourses = AppStore.getDeletedCourses();

    if (deletedCourses.length > 0 && (event == null || (event.keyCode === 90 && (event.ctrlKey || event.metaKey)))) {
        const lastDeleted = deletedCourses[deletedCourses.length - 1];

        if (lastDeleted !== undefined) {
            addCourse(lastDeleted.section, lastDeleted, lastDeleted.term, lastDeleted.scheduleIndex, lastDeleted.color);

            dispatcher.dispatch({
                type: 'UNDO_DELETE',
                deletedCourses: deletedCourses.slice(0, deletedCourses.length - 1),
            });

            openSnackbar(
                'success',
                `Undo delete ${lastDeleted.deptCode} ${lastDeleted.courseNumber} in schedule ${
                    lastDeleted.scheduleIndex + 1
                }.`
            );
        }

        ReactGA.event({
            category: 'antalmanac-rewrite',
            action: 'Click Undo button',
        });
    }
};

export const changeCurrentSchedule = (newScheduleIndex) => {
    dispatcher.dispatch({ type: 'CHANGE_CURRENT_SCHEDULE', newScheduleIndex });
};

export const changeCustomEventColor = (customEventID, newColor) => {
    const customEvents = AppStore.getCustomEvents();

    const customEventsAfterColorChange = customEvents.map((customEvent) => {
        if (customEvent.customEventID === customEventID) {
            return { ...customEvent, color: newColor };
        } else {
            return customEvent;
        }
    });

    dispatcher.dispatch({
        type: 'CUSTOM_EVENT_COLOR_CHANGE',
        customEventsAfterColorChange,
        customEventID,
        newColor,
    });
};

export const changeCourseColor = (sectionCode, newColor, term) => {
    const addedCourses = AppStore.getAddedCourses();

    const addedCoursesAfterColorChange = addedCourses.map((addedCourse) => {
        if (addedCourse.section.sectionCode === sectionCode && addedCourse.term === term) {
            return { ...addedCourse, color: newColor };
        } else {
            return addedCourse;
        }
    });

    dispatcher.dispatch({
        type: 'COURSE_COLOR_CHANGE',
        addedCoursesAfterColorChange,
        sectionCode,
        newColor,
    });
};

export const copySchedule = (from, to) => {
    const addedCourses = AppStore.getAddedCourses();
    const customEvents = AppStore.getCustomEvents();
    const scheduleNames = AppStore.getScheduleNames();

    const addedCoursesAfterCopy = addedCourses.map((addedCourse) => {
        if (addedCourse.scheduleIndices.includes(from) && !addedCourse.scheduleIndices.includes(to)) {
            // If to is equal to the length of scheduleNames, then the user wanted to copy to
            // all schedules; otherwise, if to is less than the length of scheduleNames, then
            // only one schedule should be altered
            if (to === scheduleNames.length)
                return { ...addedCourse, scheduleIndices: scheduleNames.map((_, index) => index) };
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
            if (to === scheduleNames.length)
                return { ...customEvent, scheduleIndices: scheduleNames.map((_, index) => index) };
            else
                return {
                    ...customEvent,
                    scheduleIndices: customEvent.scheduleIndices.concat(to),
                };
        } else {
            return customEvent;
        }
    });

    ReactGA.event({
        category: 'antalmanac-rewrite',
        action: 'Click Copy Schedule',
    });

    logAnalytics({
        category: analyticsEnum.addedClasses.title,
        action: analyticsEnum.addedClasses.actions.COPY_SCHEDULE,
    });

    dispatcher.dispatch({
        type: 'COPY_SCHEDULE',
        addedCoursesAfterCopy,
        customEventsAfterCopy,
    });
};

export const toggleTheme = (radioGroupEvent) => {
    dispatcher.dispatch({
        type: 'TOGGLE_THEME',
        theme: radioGroupEvent.target.value,
    });
    ReactGA.event({
        category: 'antalmanac-rewrite',
        action: 'toggle theme',
    });
    logAnalytics({
        category: analyticsEnum.nav.title,
        action: analyticsEnum.nav.actions.CHANGE_THEME,
        label: radioGroupEvent.target.value,
    });
};

export const addSchedule = (scheduleName) => {
    const newScheduleNames = [...AppStore.getScheduleNames(), scheduleName];

    dispatcher.dispatch({
        type: 'ADD_SCHEDULE',
        newScheduleNames,
    });
};

export const renameSchedule = (scheduleName, scheduleIndex) => {
    let newScheduleNames = [...AppStore.getScheduleNames()];
    newScheduleNames[scheduleIndex] = scheduleName;

    dispatcher.dispatch({
        type: 'RENAME_SCHEDULE',
        newScheduleNames,
    });
};

// After a schedule is deleted, we need to update every course and
// custom event in every schedule. In this case, we want to update the
// scheduleIndices array so that each event appears in the correct schedule
const getEventsAfterDeleteSchedule = (events) => {
    let newEvents = [];
    const currentScheduleIndex = AppStore.getCurrentScheduleIndex();

    events.forEach((event) => {
        let newScheduleIndices = [];

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

export const deleteSchedule = (scheduleIndex) => {
    let newScheduleNames = [...AppStore.getScheduleNames()];
    newScheduleNames.splice(scheduleIndex, 1);

    let newScheduleIndex = AppStore.getCurrentScheduleIndex();
    if (newScheduleIndex === newScheduleNames.length) {
        newScheduleIndex--;
    }

    const newAddedCourses = getEventsAfterDeleteSchedule(AppStore.getAddedCourses());
    const newCustomEvents = getEventsAfterDeleteSchedule(AppStore.getCustomEvents());

    dispatcher.dispatch({
        type: 'DELETE_SCHEDULE',
        newScheduleNames,
        newScheduleIndex,
        newAddedCourses,
        newCustomEvents,
    });
};
