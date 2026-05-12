import type { NotifyOn } from '$stores/NotificationStore';
import { PostHog } from 'posthog-js/react';
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
    review: AnalyticsCategory;
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
            CLICK_PAST_SYLLABI: 'Click Past Syllabi',
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
    review: {
        title: 'Review Prompt',
        actions: {
            PROMPT_SHOWN: 'Review Prompt Shown',
            ENROLLMENT_CONFIRMED: 'Review Enrollment Confirmed',
            DISMISSED: 'Review Prompt Dismissed',
            SUBMITTED: 'Review Submitted',
            REVIEW_ANOTHER_CLICKED: 'Review Another Clicked',
            REVIEW_DONE_CLICKED: 'Review Done Clicked',
            REVIEW_SUCCESS_DISMISSED: 'Review Success Dismissed',
        },
    },
};

export default analyticsEnum;

// There is no explicit type for what PostHog accepts as a property value
// A list of accepted types: https://posthog.com/docs/data/events#event-properties
export type PostHogPropertyValue = string | number | boolean | Date | PostHogPropertyValue[];

export const AANTS_ANALYTICS_ACTIONS: Record<keyof NotifyOn, string> = {
    notifyOnOpen: analyticsEnum.aants.actions.TOGGLE_NOTIFY_OPEN,
    notifyOnWaitlist: analyticsEnum.aants.actions.TOGGLE_NOTIFY_WAITLIST,
    notifyOnFull: analyticsEnum.aants.actions.TOGGLE_NOTIFY_FULL,
    notifyOnRestriction: analyticsEnum.aants.actions.TOGGLE_NOTIFY_RESTRICTION,
};

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
        ...customProps,
        category: category.title,
        error,
    });
}

export function analyticsIdentifyUser(postHog: PostHog | undefined, userId?: string) {
    if (!postHog || !userId) return;

    const currentId = postHog.get_distinct_id();
    if (currentId !== userId) {
        postHog.identify(userId);
    }
}
