import type { AASection, Section } from '@packages/peterportal'

export interface RepeatingCustomEvent {
  title: string
  start: string
  end: string
  days: boolean[]
  customEventID: number
  color?: string
}

export interface CourseDetails {
  courseComment: string
  courseNumber: string
  courseTitle: string
  deptCode: string
  prerequisiteLink: string
}

export interface CourseInfo {
  courseDetails: CourseDetails
  section: Section
}

export interface Course extends CourseDetails {
  section: AASection
  term: string
}

export interface Schedule {
  scheduleName: string
  courses: Course[]
  customEvents: RepeatingCustomEvent[]
}

export interface ShortCourse {
  color: string
  term: string
  sectionCode: string
}

export interface ShortCourseSchedule {
  scheduleName: string
  courses: ShortCourse[]
  customEvents: RepeatingCustomEvent[]
}

/**
 * saved schedule in the database (similar to the undo state, but with less data)
 */
export interface ScheduleSaveState {
  schedules: ShortCourseSchedule[]
  scheduleIndex: number
}

/**
 * saved schedule in memory
 */
export interface ScheduleUndoState {
  schedules: Schedule[]
  scheduleIndex: number
}

export interface LegacyShortCourseInfo extends ShortCourse {
  scheduleIndices: number[]
}

export interface LegacyRepeatingCustomEvent extends RepeatingCustomEvent {
  scheduleIndices: number[]
}

export interface LegacyUserData {
  addedCourses: LegacyShortCourseInfo[]
  scheduleNames: string[]
  customEvents: LegacyRepeatingCustomEvent[]
}

