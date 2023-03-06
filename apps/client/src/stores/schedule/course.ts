/**
 * functions that manage courses in the schedule store
 * @remarks structuredClone is used to deep clone state so it doesn't get affected by mutations to the original
 */

import type { WebsocSection, WebsocCourse } from 'peterportal-api-next-types'
import * as colors from '@mui/material/colors'
import type { Course } from '@packages/types'
import { analyticsEnum, logAnalytics } from '$lib/analytics'
import { courseNumAsDecimal } from '$lib/helpers'
import { useSearchStore } from '$stores/search'
import { useScheduleStore } from '.'

/**
 * lol: the colors import is an object; iterate through all the values and return their 500 variant
 */
const arrayOfColors = Object.values(colors).map((c) => ('black' in c ? c.black : c[500]))

/**
 * AACourse without the "sections" property
 */
type SimpleAACourse = Omit<WebsocCourse, 'sections'>

/**
 * after the function runs, it can execute the appropriate callbck if provided
 */
interface Options {
  onError?: (error: Error) => void
  onWarn?: (message: string) => void
}

/**
 * add a course to a schedule
 * @param section
 * @param course AACourse
 * @param addScheduleIndex index of schedule in the array to target
 * @param options callbacks
 */
export function addCourse(section: WebsocSection, course: SimpleAACourse, addScheduleIndex?: number, options?: Options) {
  const { form } = useSearchStore.getState()
  const { schedules, scheduleIndex, previousStates } = useScheduleStore.getState()

  const targetScheduleIndex = addScheduleIndex ?? scheduleIndex
  const allCourses = schedules[targetScheduleIndex].courses

  const existingCourse = allCourses.find((c) => c.section.sectionCode === section.sectionCode && c.term === form.term)

  if (existingCourse) {
    options?.onError?.(new Error('Course already exists in schedule'))
    return
  }

  const setOfUsedColors = new Set(allCourses.map((c) => c.section.color))
  const color = arrayOfColors.find((materialColor) => !setOfUsedColors.has(materialColor)) || '#5ec8e0'

  const newCourse: Course = {
    term: form.term,
    deptCode: course.deptCode,
    courseNumber: course.courseNumber,
    courseTitle: course.courseTitle,
    courseComment: course.courseComment,
    prerequisiteLink: course.prerequisiteLink,
    section: { ...section, color },
  }

  const oldSchedules = structuredClone(schedules)
  schedules[targetScheduleIndex]?.courses.push(newCourse)

  previousStates.push({ schedules: oldSchedules, scheduleIndex })
  useScheduleStore.setState({ schedules, previousStates, saved: false })

  logAnalytics({
    category: analyticsEnum.classSearch.title,
    action: analyticsEnum.classSearch.actions.ADD_COURSE,
    label: course.deptCode,
    value: courseNumAsDecimal(course.courseNumber),
  })
}

/**
 * save a course to all schedules
 * @param section
 * @param course
 * @param save whether to immediately commit these changes
 */
export function addCourseToAllSchedules(section: WebsocSection, course: SimpleAACourse, options?: Options) {
  const { schedules } = useScheduleStore.getState()
  schedules.forEach((_schedule, index) => addCourse(section, course, index, options))
}

/**
 * change a course's color
 * @remarks component will log Google Analytics, not this function
 * @param sectionCode section code
 * @param term
 * @param newColor color
 */
export function changeCourseColor(sectionCode: string, term: string, newColor: string) {
  const { schedules } = useScheduleStore.getState()
  const allCourses = schedules.map((schedule) => schedule.courses).flat(1)
  const course = allCourses.find((c) => c.section.sectionCode === sectionCode && c.term === term)
  if (course) {
    course.section.color = newColor
    useScheduleStore.setState({ schedules })
  }
}

/**
 * delete a course from schedule
 * @param sectionCode section code
 * @param term term
 */
export function deleteCourse(sectionCode: string, term: string) {
  const { schedules, scheduleIndex, previousStates } = useScheduleStore.getState()

  previousStates.push({ schedules: structuredClone(schedules), scheduleIndex })

  const index = schedules[scheduleIndex].courses.findIndex(
    (c) => c.section.sectionCode === sectionCode && c.term === term
  )

  schedules[scheduleIndex].courses.splice(index, 1)
  useScheduleStore.setState({ schedules, previousStates, saved: false })

  logAnalytics({
    category: analyticsEnum.addedClasses.title,
    action: analyticsEnum.addedClasses.actions.DELETE_COURSE,
  })
}

/**
 * if target schedule index === length, add all current courses to all schedules
 * else add all current courses to the target schedule
 */
export function copyCoursesToSchedule(toScheduleIndex: number, options?: Options) {
  const { schedules, scheduleIndex } = useScheduleStore.getState()
  if (toScheduleIndex === schedules.length) {
    schedules[scheduleIndex].courses.forEach((course) => {
      addCourseToAllSchedules(course.section, course, options)
    })
  } else {
    schedules[scheduleIndex].courses.forEach((course) => addCourse(course.section, course, toScheduleIndex, options))
  }

  logAnalytics({
    category: analyticsEnum.addedClasses.title,
    action: analyticsEnum.addedClasses.actions.COPY_SCHEDULE,
  })
}
