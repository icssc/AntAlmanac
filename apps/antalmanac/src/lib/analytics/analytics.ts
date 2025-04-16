import ReactGA4 from 'react-ga4';
/**
 * This is an enum that stores all the
 * possible category names and associated actions
 * for Google Analytics
 */
const analyticsEnum = {
    calendar: {
        title: 'Calendar Pane',
        actions: {
            DELETE_COURSE: 'Delete Course',
            CHANGE_COURSE_COLOR: 'Change Course Color',
            COPY_COURSE_CODE: 'Copy Course Code',
            CLICK_CUSTOM_EVENT: 'Click Custom Event Button',
            ADD_CUSTOM_EVENT: 'Add Custom Event',
            DELETE_CUSTOM_EVENT: 'Delete Custom Event',
            SCREENSHOT: 'Screenshot',
            CLEAR_SCHEDULE: 'Clear Schedule',
            DISPLAY_FINALS: 'Display Finals',
            CHANGE_SCHEDULE: 'Change Schedule',
            UNDO: 'Undo',
            DOWNLOAD: 'Download Schedule',
        },
    },
    nav: {
        title: 'Navbar',
        actions: {
            CLICK_NOTIFICATIONS: 'Click Notifications',
            CLICK_ABOUT: 'Click About Page',
            CHANGE_THEME: 'Change Theme', // Label is the theme changed to
            IMPORT_STUDY_LIST: 'Import Study List', // Value is the percentage of courses successfully imported (decimal value)
            LOAD_SCHEDULE: 'Load Schedule', // Value is 1 if the user checked "remember me", 0 otherwise
            SAVE_SCHEDULE: 'Save Schedule', // Value is 1 if the user checked "remember me", 0 otherwise
            CLICK_NEWS: 'Click News',
        },
    },
    classSearch: {
        title: 'Class Search',
        actions: {
            MANUAL_SEARCH: 'Manual Search',
            FUZZY_SEARCH: 'Fuzzy Search',
            ADD_COURSE: 'Add Course', //Label is department, value is 1 if lower div, else 0
            CLICK_INFO: 'Click "Info"',
            CLICK_PREREQUISITES: 'Click "Prerequisites"',
            CLICK_GRADES: 'Click "Grades"',
            CLICK_ZOTISTICS: 'Click "Zotistics"',
            CLICK_REVIEWS: 'Click "Reviews"',
            CLICK_PAST_ENROLLMENT: 'Click "Past Enrollment"',
            ADD_SPECIFIC: 'Add Course to Specific Schedule',
            COPY_COURSE_CODE: 'Copy Course Code',
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
        },
    },
    map: {
        title: 'Map',
        actions: {
            OPEN: 'Open Map',
            CLICK_PIN: 'Click on Pin',
        },
    },
};

export default analyticsEnum;

interface AnalyticsProps {
    category: string;
    action: string;
    label?: string;
    value?: number;
}

/**
 * This is just a wrapper around ReactGA4.event so we don't have to import it everywhere
 */
export function logAnalytics({ category, action, label, value }: AnalyticsProps) {
    ReactGA4.event({ category, action, label, value });
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
