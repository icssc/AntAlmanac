/**
 * This is an enum that stores all the
 * possible category names and associated actions
 * for Google Analytics
 */
export default {
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
        },
    },
    nav: {
        title: 'Navbar',
        actions: {
            CLICK_NOTIFICATIONS: 'Click Notifications',
            VIEW_ABOUT: 'View About Page',
            CHANGE_THEME: 'Change Theme', // Label is the theme changed to
            IMPORT_STUDY_LIST: 'Import Study List', // Value is percentage course imported
            LOAD_SCHEDULE: 'Load Schedule',
            SAVE_SCHEDULE: 'Save Schedule',
            CLICK_NEWS: 'Click News',
        },
    },
};
