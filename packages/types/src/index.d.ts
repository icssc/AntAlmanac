import type { WebsocSection, WebsocAPIResponse } from 'peterportal-api-next-types'

//-----------------------------------------------------------------------------------
// main data entities
//-----------------------------------------------------------------------------------

/**
 * modified section from peterportal websoc
 */
export interface Section extends WebsocSection {
  /**
   * color for the calendar
   */
  color: string
}

/**
 * modified section from the AACourse
 */
export interface Course extends WebsocCourse {
  /**
   * a course in the schedule is associated with a term, e.g. 2020 Fall
   */
  term: string

  /**
   * a course in the schedule is associated with a single section after it's added
   */
  section: Section
}

/**
 * custom calendar event, similar to react-big-calendar's events
 */
export interface RepeatingCustomEvent {
  title: string
  start: string
  end: string
  days: boolean[]
  color?: string
  customEventID: number
}

/**
 * complete schedule data stored in memory during runtime
 */
export interface Schedule {
  scheduleName: string
  courses: Course[]
  customEvents: RepeatingCustomEvent[]
}

//-----------------------------------------------------------------------------------
// schedule saving
//-----------------------------------------------------------------------------------

/**
 * trimmed course properties
 */
export interface ShortCourse {
  color: string
  term: string
  sectionCode: string
}

/**
 * minimal schedule
 */
export interface ShortCourseSchedule {
  scheduleName: string
  courses: ShortCourse[]
  customEvents: RepeatingCustomEvent[]
}

/**
 * minimal schedule data stored in database
 */
export interface SavedSchedule {
  schedules: ShortCourseSchedule[]
  scheduleIndex: number
}

//-----------------------------------------------------------------------------------
// legacy support
//-----------------------------------------------------------------------------------

export interface LegacyShortCourseInfo extends ShortCourse {
  scheduleIndices: number[]
}

export interface LegacyRepeatingCustomEvent extends RepeatingCustomEvent {
  scheduleIndices: number[]
}

export interface LegacySavedSchedule {
  addedCourses: LegacyShortCourseInfo[]
  scheduleNames: string[]
  customEvents: LegacyRepeatingCustomEvent[]
}
