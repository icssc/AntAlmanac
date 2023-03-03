import ReactGA4 from 'react-ga4'

interface AnalyticsProps {
  category: string
  action: string
  label?: string
  value?: number
}

/**
 * wrapper around ReactGA4.event
 */
export function logAnalytics(props: AnalyticsProps) {
  ReactGA4.event(props)
}

/**
 * all possible category names and associated actions for Google Analytics
 */
export const analyticsEnum = {
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
      ADD_COURSE: 'Add Course', // Label is department, value is 1 if lower div, else 0
      CLICK_INFO: 'Click "Info"',
      CLICK_PREREQUISITES: 'Click "Prerequisites"',
      CLICK_GRADES: 'Click "Grades"',
      CLICK_ZOTISTICS: 'Click "Zotistics"',
      CLICK_REVIEWS: 'Click "Reviews"',
      CLICK_PAST_ENROLLMENT: 'Click "Past Enrollment"',
      ADD_SPECIFIC: 'Add Course to Specific Schedule',
      COPY_COURSE_CODE: 'Copy Course Code',
      REFRESH: 'Refresh Results',
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
} as const
