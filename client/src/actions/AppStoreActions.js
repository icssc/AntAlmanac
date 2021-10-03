import dispatcher from '../dispatcher';
import AppStore from '../stores/AppStore';
import ReactGA from 'react-ga';
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
import { getCoursesData } from '../helpers';
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

export const addCourse = (section, courseDetails, term, scheduleIndex, color) => {
    const addedCourses = AppStore.getAddedCourses();

    let existingCourse;
    let multipleTerms = new Set([term]);

    for (const course of addedCourses) {
        multipleTerms.add(course.term);

        if (course.section.sectionCode === section.sectionCode && term === course.term) {
            existingCourse = course;
            if (course.scheduleIndices.includes(scheduleIndex)) {
                return;
            } else {
                break;
            }
        }
    }

    if (multipleTerms.size > 1)
        openSnackbar(
            'warning',
            `Course added from different term.\nSchedule now contains courses from ${[...multipleTerms]
                .sort()
                .join(', ')}.`,
            null,
            null,
            { whiteSpace: 'pre-line' }
        );

    if (color === undefined) {
        const setOfUsedColors = new Set(addedCourses.map((course) => course.color));

        color = arrayOfColors.find((materialColor) => {
            if (!setOfUsedColors.has(materialColor)) return materialColor;
            else return undefined;
        });

        if (color === undefined) color = '#5ec8e0';
    }

    if (existingCourse === undefined) {
        const newCourse = {
            color: color,
            term: term,
            deptCode: courseDetails.deptCode,
            courseNumber: courseDetails.courseNumber,
            courseTitle: courseDetails.courseTitle,
            courseComment: courseDetails.courseComment,
            prerequisiteLink: courseDetails.prerequisiteLink,
            scheduleIndices: scheduleIndex === 4 ? [0, 1, 2, 3] : [scheduleIndex],
            section: section,
        };
        dispatcher.dispatch({ type: 'ADD_COURSE', newCourse });
    } else {
        const newSection = {
            ...existingCourse,
            scheduleIndices: scheduleIndex === 4 ? [0, 1, 2, 3] : existingCourse.scheduleIndices.concat(scheduleIndex),
        };
        dispatcher.dispatch({ type: 'ADD_SECTION', newSection });
    }
};

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

            const userData = { addedCourses: [], customEvents: customEvents };

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
    });
};

export const copySchedule = (from, to) => {
    const addedCourses = AppStore.getAddedCourses();
    const customEvents = AppStore.getCustomEvents();

    const addedCoursesAfterCopy = addedCourses.map((addedCourse) => {
        if (addedCourse.scheduleIndices.includes(from) && !addedCourse.scheduleIndices.includes(to)) {
            if (to === 4) return { ...addedCourse, scheduleIndices: [0, 1, 2, 3] };
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
            if (to === 4) return { ...customEvent, scheduleIndices: [0, 1, 2, 3] };
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

    dispatcher.dispatch({
        type: 'COPY_SCHEDULE',
        addedCoursesAfterCopy,
        customEventsAfterCopy,
    });
};

export const toggleDarkMode = (switchEvent) => {
    dispatcher.dispatch({
        type: 'TOGGLE_DARK_MODE',
        darkMode: switchEvent.target.checked,
    });
    ReactGA.event({
        category: 'antalmanac-rewrite',
        action: 'toggle dark mode',
    });
};
