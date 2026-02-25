import { PostHog } from 'posthog-js/react';

import { NotifyOn } from '$stores/NotificationStore';
/**
 * This is an enum that stores all the
 * possible category names and associated actions
 */
export interface AnalyticsCategory {
    title: string;
    actions: Record<string, string>;
}

export interface AnalyticsEnum {
    calendar: AnalyticsCategory;
    auth: AnalyticsCategory;
    nav: AnalyticsCategory;
    classSearch: AnalyticsCategory;
    addedClasses: AnalyticsCategory;
    map: AnalyticsCategory;
    aants: AnalyticsCategory;
}

const analyticsEnum: AnalyticsEnum = {
    calendar: {
        title: 'Calendar Pane',
        actions: {
            DELETE_COURSE: 'Delete Course',
            CHANGE_COURSE_COLOR: 'Change Course Color',
            COPY_COURSE_CODE: 'Copy Section Code',
            CLICK_CUSTOM_EVENT: 'Click Custom Event Button',
            ADD_CUSTOM_EVENT: 'Add Custom Event',
            DELETE_CUSTOM_EVENT: 'Delete Custom Event',
            SCREENSHOT: 'Screenshot',
            CLEAR_SCHEDULE: 'Clear Schedule',
            DISPLAY_FINALS: 'Display Finals',
            CHANGE_SCHEDULE: 'Change Schedule',
            UNDO: 'Undo',
            REDO: 'Redo',
            DOWNLOAD: 'Download Schedule',
        },
    },
    auth: {
        title: 'Auth',
        actions: {
            SIGN_IN: 'Sign In',
            SIGN_IN_FAIL: 'Sign In Failure',
            SIGN_OUT: 'Sign Out',
            SIGN_OUT_FAIL: 'Sign Out Failure',
            LOAD_SCHEDULE: 'Load Schedule',
            LOAD_SCHEDULE_FAIL: 'Load Schedule Failure',
            LOAD_SCHEDULE_LEGACY: 'Load Schedule Legacy',
            LOAD_SCHEDULE_LEGACY_FAIL: 'Load Schedule Legacy Failure',
            SAVE_SCHEDULE: 'Save Schedule',
            SAVE_SCHEDULE_FAIL: 'Save Schedule Failure',
        },
    },
    nav: {
        title: 'Navbar',
        actions: {
            CLICK_NOTIFICATIONS: 'Click Notifications',
            CLICK_ABOUT: 'Click About Page',
            CLICK_SAVE: 'Click Save Button',
            CLICK_LOAD: 'Click Load Button',
            CHANGE_THEME: 'Change Theme',
            IMPORT_STUDY_LIST: 'Import Study List',
            IMPORT_ZOTCOURSE: 'Import Zotcourse Schedule',
            IMPORT_LEGACY: 'Import From Legacy Username',
        },
    },
    classSearch: {
        title: 'Class Search',
        actions: {
            MANUAL_SEARCH: 'Manual Search',
            FUZZY_SEARCH: 'Fuzzy Search',
            ADD_COURSE: 'Add Course',
            CLICK_INFO: 'Click "Info"',
            CLICK_PREREQUISITES: 'Click "Prerequisites"',
            CLICK_GRADES: 'Click "Grades"',
            CLICK_ZOTISTICS: 'Click "Zotistics"',
            CLICK_REVIEWS: 'Click "Reviews"',
            CLICK_PAST_ENROLLMENT: 'Click "Past Enrollment"',
            ADD_SPECIFIC: 'Add Course to Specific Schedule',
            COPY_COURSE_CODE: 'Copy Section Code',
            REFRESH: 'Refresh Results',
            TOGGLE_COLUMNS: 'Toggle Columns',
        },
    },
    addedClasses: {
        title: 'Added Classes',
        actions: {
            DELETE_COURSE: 'Delete Course',
            OPEN: 'Open Added Classes',
            COPY_SCHEDULE: 'Copy Schedule',
            CLEAR_SCHEDULE: 'Clear Schedule',
            CHANGE_COURSE_COLOR: 'Change Course Color',
            COPY_COURSE_CODE: 'Copy Section Code',
        },
    },
    map: {
        title: 'Map',
        actions: {
            OPEN: 'Open Map',
            CLICK_PIN: 'Click on Pin',
        },
    },
    aants: {
        title: 'AANTS',
        actions: {
            OPEN_MANAGE_NOTIFICATIONS: 'Open Manage Notifications Dialog',
            CLOSE_MANAGE_NOTIFICATIONS: 'Close Manage Notifications Dialog',
            OPEN_SECTION_NOTIFICATIONS: 'Open Section Notifications Dropdown',
            TOGGLE_NOTIFY_OPEN: 'Toggle Notify on Open',
            TOGGLE_NOTIFY_WAITLIST: 'Toggle Notify on Waitlist',
            TOGGLE_NOTIFY_FULL: 'Toggle Notify on Full',
            TOGGLE_NOTIFY_RESTRICTION: 'Toggle Notify on Restriction Changes',
            DELETE_NOTIFICATION: 'Delete Notification',
        },
    },
};

export default analyticsEnum;

export const AANTS_ANALYTICS_ACTIONS: Record<keyof NotifyOn, string> = {
    notifyOnOpen: analyticsEnum.aants.actions.TOGGLE_NOTIFY_OPEN,
    notifyOnWaitlist: analyticsEnum.aants.actions.TOGGLE_NOTIFY_WAITLIST,
    notifyOnFull: analyticsEnum.aants.actions.TOGGLE_NOTIFY_FULL,
    notifyOnRestriction: analyticsEnum.aants.actions.TOGGLE_NOTIFY_RESTRICTION,
};

// There is no explicit type for what PostHog accepts as a property value
// A list of accepted types: https://posthog.com/docs/data/events#event-properties
export type PostHogPropertyValue = string | number | boolean | Date | PostHogPropertyValue[];

interface AnalyticsProps {
    category: AnalyticsCategory;
    action: string;
    error?: string;
    customProps?: Record<string, PostHogPropertyValue>;
}

/**
 * Logs event to PostHog instance
 */
export function logAnalytics(postHog: PostHog | undefined, { category, action, error, customProps }: AnalyticsProps) {
    if (!postHog) return;
    postHog.capture(action, {
        category: category.title,
        error,
        ...customProps,
    });
}

export function analyticsIdentifyUser(postHog: PostHog | undefined, userId?: string) {
    if (!postHog || !userId) return;

    const currentId = postHog.get_distinct_id();
    if (currentId !== userId) {
        postHog.identify(userId);
    }
}

/**
 * Converts course number to a decimal representation.
 * E.g., '122A' -> 122.1, '121' -> 121
 *
 * @param courseNumber A string that represents the course number of a course (eg. '122A', '121')
 * @returns Decimal representation of courseNumber
 */
export function courseNumAsDecimal(courseNumber: string): number {
    // I wanted to split the course detail number into letters and digits
    const courseNumArr = courseNumber.split(/(\d+)/);
    // Gets rid of empty strings in courseNumArr
    const filtered = courseNumArr.filter((value) => value !== '');

    // Return 0 if array is empty
    if (filtered.length === 0) {
        console.error(`No characters were found, returning 0, Input: ${courseNumber}`);
        return 0;
    }

    const lastElement = filtered[filtered.length - 1].toUpperCase(); // .toUpperCase() won't affect numeric characters
    const lastElementCharCode = lastElement.charCodeAt(0); // Just checks the first character of the last element in the array
    // Return the last element of the filtered array as an integer if it represents an integer
    if ('0'.charCodeAt(0) <= lastElementCharCode && lastElementCharCode <= '9'.charCodeAt(0)) {
        return parseInt(lastElement);
    }

    // If the string does not have any numeric characters
    if (filtered.length === 1) {
        console.error(`The string did not have numbers, returning 0, Input: ${courseNumber}`);
        return 0;
    }

    // This element is the second to last element of the array, supposedly a string of numeric characters
    const secondToLastElement = filtered[filtered.length - 2];
    // The characters within [A-I] or [a-i] will be converted to 1-9, respectively
    const letterAsNumber = lastElement.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    if (1 <= letterAsNumber && letterAsNumber <= 9) {
        return parseFloat(`${secondToLastElement}.${letterAsNumber}`);
    } else {
        console.error(
            `The first character type at the end of the string was not within [A-I] or [a-i], returning last numbers found in string, Violating Character: ${
                filtered[filtered.length - 1][0]
            }, Input: ${courseNumber}`
        );
        // This will represent an integer at this point because the split in the beginning split the array into strings of digits and strings of other characters
        // If the last element in the array does not represent an integer, then the second to last element must represent an integer
        return parseInt(secondToLastElement);
    }
}
