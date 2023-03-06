import type { AASection, Section } from '@packages/peterportal'
import { z } from 'zod'

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

export const repeatingCustomEventSchema = z.object({
  title: z.string(),
  start: z.string(),
  end: z.string(),
  days: z.array(z.boolean()),
  customEventID: z.number(),
  color: z.string().optional()
})

export const shortCourseSchema = z.object({
  color: z.string(),
  term: z.string(),
  sectionCode: z.string()
})

export const shortCourseScheduleSchema = z.object({
  scheduleName: z.string(),
  courses: z.array(shortCourseSchema),
  customEvents: z.array(repeatingCustomEventSchema)
})

export const scheduleSaveStateSchema = z.object({
  schedules: z.array(shortCourseScheduleSchema),
  scheduleIndex: z.number()
})

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

export const defaultCourseDetails: CourseDetails = {
  courseTitle: '',
  courseNumber: '',
  courseComment: '',
  deptCode: '',
  prerequisiteLink: '',
}

export const defaultSection: Section = {
  sectionNum: '',
  status: '',
  sectionCode: '',
  sectionType: '',
  sectionComment: '',
  units: '',
  numRequested: '',
  numOnWaitlist: '',
  numNewOnlyReserved: '',
  numCurrentlyEnrolled: {
    totalEnrolled: '',
    sectionEnrolled: '',
  },
  instructors: [],
  meetings: [],
  maxCapacity: '',
  finalExam: '',
  restrictions: '',
}

export const defaultCourseInfo: CourseInfo = {
  courseDetails: structuredClone(defaultCourseDetails),
  section: structuredClone(defaultSection)
}
