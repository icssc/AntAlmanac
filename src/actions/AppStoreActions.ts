import AppStore, {AppStoreCourse, UserData} from '../stores/AppStore';
import { VariantType } from 'notistack';
import analyticsEnum, { logAnalytics } from '../analytics';
import { CourseDetails, courseNumAsDecimal } from '../helpers';
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
import { Section } from '../peterportal.types';
import { SnackbarPosition } from '../components/AppBar/NotificationSnackbar';
import { RepeatingCustomEvent } from '../components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';

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

export const addCourse = (section: Section, courseDetails: CourseDetails, term: string, scheduleIndex: number, color?: string, quiet?: boolean) => {
    logAnalytics({
        category: analyticsEnum.classSearch.title,
        action: analyticsEnum.classSearch.actions.ADD_COURSE,
        label: courseDetails.deptCode,
        value: courseNumAsDecimal(courseDetails.courseNumber),
    });
    const addedCourses = AppStore.getAddedCourses();
    const terms = termsInSchedule(term);
    const existingCourse = AppStore.schedule.getExistingCourse(section.sectionCode, term);

    if (terms.size > 1 && !quiet) warnMultipleTerms(terms);

    if (existingCourse !== undefined)  {
        if (AppStore.schedule.doesCourseExistInCurrentSchedule(existingCourse.section.sectionCode, existingCourse.term)) {
            return existingCourse.color
        }
        color = existingCourse.color
    }

    if (color === undefined) {
        const setOfUsedColors = new Set(addedCourses.map((course) => course.color));

        color = arrayOfColors.find((materialColor) => {
            if (!setOfUsedColors.has(materialColor)) return materialColor;
            else return undefined;
        });

        if (color === undefined) color = '#5ec8e0';
    }

    const newCourse: AppStoreCourse = {
        color: color,
        term: term,
        deptCode: courseDetails.deptCode,
        courseNumber: courseDetails.courseNumber,
        courseTitle: courseDetails.courseTitle,
        courseComment: courseDetails.courseComment,
        prerequisiteLink: courseDetails.prerequisiteLink,
        section: {...section, color: color},
    };
    if (scheduleIndex === AppStore.schedule.getNumberOfSchedules()) {
        AppStore.addCourse(newCourse, true)
    } else {
        AppStore.addCourse(newCourse)
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
export const openSnackbar = (variant: VariantType, message: string, duration?: number, position?: SnackbarPosition, style?: {[cssPropertyName: string]: string}) => {
    AppStore.openSnackbar(variant, message, duration, position, style);
};

export const saveSchedule = async (userID: string, rememberMe: boolean) => {
    throw new Error('Not Implemented')
    // logAnalytics({
    //     category: analyticsEnum.nav.title,
    //     action: analyticsEnum.nav.actions.SAVE_SCHEDULE,
    //     label: userID,
    //     value: rememberMe? 1:0,
    // });
    // if (userID != null) {
    //     userID = userID.replace(/\s+/g, '');
    //
    //     if (userID.length > 0) {
    //         if (rememberMe) {
    //             window.localStorage.setItem('userID', userID);
    //         } else {
    //             window.localStorage.removeItem('userID');
    //         }
    //
    //         const addedCourses = AppStore.getAddedCourses();
    //         const customEvents = AppStore.getCustomEvents();
    //         const scheduleNames = AppStore.getScheduleNames();
    //
    //         interface ShortCourseInfo {
    //             color: string
    //             term: string
    //             sectionCode: string
    //             scheduleIndices: number[]
    //         }
    //
    //         const userData = { addedCourses: [] as ShortCourseInfo[], scheduleNames: scheduleNames, customEvents: customEvents };
    //
    //         userData.addedCourses = addedCourses.map((course) => {
    //             return {
    //                 color: course.color,
    //                 term: course.term,
    //                 sectionCode: course.section.sectionCode,
    //                 scheduleIndices: course.scheduleIndices,
    //             };
    //         });
    //
    //         try {
    //             await fetch(SAVE_DATA_ENDPOINT, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify({ userID, userData }),
    //             });
    //
    //             openSnackbar(
    //                 'success',
    //                 `Schedule saved under username "${userID}". Don't forget to sign up for classes on WebReg!`
    //             );
    //             AppStore.saveSchedule();
    //         } catch (e) {
    //             openSnackbar('error', `Schedule could not be saved under username "${userID}`);
    //         }
    //     }
    // }
};

export const loadSchedule = async (userID: string, rememberMe: boolean) => {
    throw new Error('Not Implemented')
    // logAnalytics({
    //     category: analyticsEnum.nav.title,
    //     action: analyticsEnum.nav.actions.LOAD_SCHEDULE,
    //     label: userID,
    //     value: rememberMe? 1:0,
    // });
    // if (
    //     userID != null &&
    //     (!AppStore.hasUnsavedChanges() ||
    //         window.confirm(`Are you sure you want to load a different schedule? You have unsaved changes!`))
    // ) {
    //     userID = userID.replace(/\s+/g, '');
    //
    //     if (userID.length > 0) {
    //         if (rememberMe) {
    //             window.localStorage.setItem('userID', userID);
    //         } else {
    //             window.localStorage.removeItem('userID');
    //         }
    //
    //         try {
    //             const data = await fetch(LOAD_DATA_ENDPOINT, {
    //                 method: 'POST',
    //                 headers: { 'Content-Type': 'application/json' },
    //                 body: JSON.stringify({ userID: userID }),
    //             });
    //
    //             const json = await data.json();
    //
    //             AppStore.loadSchedule(await getCoursesData(json.userData) as UserData);
    //
    //             openSnackbar('success', `Schedule for username "${userID}" loaded.`);
    //         } catch (e) {
    //             openSnackbar('error', `Couldn't find schedules for username "${userID}".`);
    //         }
    //     }
    // }
};

export const deleteCourse = (sectionCode: string,  term: string) => {
    AppStore.deleteCourse(sectionCode, term)
};

export const deleteCustomEvent = (customEventID: number) => {
    throw new Error('Not Implemented')
    // const customEvents = AppStore.getCustomEvents();
    //
    // const customEventsAfterDelete = customEvents.filter((customEvent) => {
    //     if (customEvent.customEventID === customEventID) {
    //         if (customEvent.scheduleIndices.length === 1) {
    //             return false;
    //         } else {
    //             customEvent.scheduleIndices = customEvent.scheduleIndices.filter((index) => index !== scheduleIndex);
    //
    //             return true;
    //         }
    //     }
    //     return true;
    // });
    //
    // AppStore.deleteCustomEvent(customEventsAfterDelete);
};

export const editCustomEvent = (newCustomEvent: RepeatingCustomEvent) => {
    // const customEventsAfterEdit = AppStore.getCustomEvents().map((customEvent) => {
    //     if (newCustomEvent.customEventID !== customEvent.customEventID) return customEvent;
    //     else return newCustomEvent;
    // });
    // AppStore.editCustomEvent(customEventsAfterEdit);
};

export const clearSchedules = () => {
    AppStore.clearSchedule();
};

export const addCustomEvent = (customEvent: RepeatingCustomEvent) => {
    throw new Error('Not Implemented')
    // AppStore.addCustomEvent(customEvent);
};

export const undoDelete = (event: KeyboardEvent|null) => {
    throw new Error('Not Implemented')
    // const deletedCourses = AppStore.getDeletedCourses();
    //
    // if (deletedCourses.length > 0 && (event == null || (event.keyCode === 90 && (event.ctrlKey || event.metaKey)))) {
    //     const lastDeleted = deletedCourses[deletedCourses.length - 1];
    //
    //     if (lastDeleted !== undefined) {
    //         addCourse(lastDeleted.section, lastDeleted, lastDeleted.term, lastDeleted.scheduleIndex, lastDeleted.color);
    //
    //         AppStore.undoDelete(deletedCourses.slice(0, deletedCourses.length - 1));
    //
    //         openSnackbar(
    //             'success',
    //             `Undo delete ${lastDeleted.deptCode} ${lastDeleted.courseNumber} in schedule ${
    //                 lastDeleted.scheduleIndex + 1
    //             }.`
    //         );
    //     }
    //
    //     ReactGA.event({
    //         category: 'antalmanac-rewrite',
    //         action: 'Click Undo button',
    //     });
    // }
};

export const changeCurrentSchedule = (newScheduleIndex: number) => {
    AppStore.changeCurrentSchedule(newScheduleIndex);
};

export const changeCustomEventColor = (customEventID: number, newColor: string) => {
    throw new Error('Not Implemented')
    // const customEvents = AppStore.getCustomEvents();
    //
    // const customEventsAfterColorChange = customEvents.map((customEvent) => {
    //     if (customEvent.customEventID === customEventID) {
    //         return { ...customEvent, color: newColor };
    //     } else {
    //         return customEvent;
    //     }
    // });
    //
    // AppStore.changeCustomEventColor(customEventsAfterColorChange, customEventID, newColor);
};

export const changeCourseColor = (sectionCode: string, term: string, newColor: string) => {
    AppStore.changeCourseColor(sectionCode, term, newColor);
};

export const copySchedule = (from: number, to: number) => {
    throw new Error('Not Implemented')
    // const addedCourses = AppStore.getAddedCourses();
    // const customEvents = AppStore.getCustomEvents();
    // const scheduleNames = AppStore.getScheduleNames();
    //
    // const addedCoursesAfterCopy = addedCourses.map((addedCourse) => {
    //     if (addedCourse.scheduleIndices.includes(from) && !addedCourse.scheduleIndices.includes(to)) {
    //         // If to is equal to the length of scheduleNames, then the user wanted to copy to
    //         // all schedules; otherwise, if to is less than the length of scheduleNames, then
    //         // only one schedule should be altered
    //         if (to === scheduleNames.length)
    //             return { ...addedCourse, scheduleIndices: [...scheduleNames.keys()] }; // this [...array.keys()] idiom is like list(range(len(array))) in python
    //         else
    //             return {
    //                 ...addedCourse,
    //                 scheduleIndices: addedCourse.scheduleIndices.concat(to),
    //             };
    //     } else {
    //         return addedCourse;
    //     }
    // });
    //
    // const customEventsAfterCopy = customEvents.map((customEvent) => {
    //     if (customEvent.scheduleIndices.includes(from) && !customEvent.scheduleIndices.includes(to)) {
    //         if (to === scheduleNames.length)
    //             return { ...customEvent, scheduleIndices: [...scheduleNames.keys()] };
    //         else
    //             return {
    //                 ...customEvent,
    //                 scheduleIndices: customEvent.scheduleIndices.concat(to),
    //             };
    //     } else {
    //         return customEvent;
    //     }
    // });
    //
    // ReactGA.event({
    //     category: 'antalmanac-rewrite',
    //     action: 'Click Copy Schedule',
    // });
    //
    // logAnalytics({
    //     category: analyticsEnum.addedClasses.title,
    //     action: analyticsEnum.addedClasses.actions.COPY_SCHEDULE,
    // });
    //
    // AppStore.copySchedule(addedCoursesAfterCopy, customEventsAfterCopy);
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
