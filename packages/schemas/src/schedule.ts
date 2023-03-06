import type { WebsocCourse, WebsocSection } from 'peterportal-api-next-types'

//-----------------------------------------------------------------------------------
// main data entities
//-----------------------------------------------------------------------------------

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
 * modified course from peterportal
 */
export interface Course extends WebsocCourse {
  term: string
  section: WebsocSection & { color: string }
}

/**
 * complete schedule
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
 * schedule data saved in database (similar to the undo state, but with less data)
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
