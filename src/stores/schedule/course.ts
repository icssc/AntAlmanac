/**
 * functions that manage courses in the schedule store
 * @remarks be careful with previousStates;
 * structuredClone is used to deep clone the object so it doesn't get affected by mutations to the original
 */

import * as colors from '@mui/material/colors'
import { analyticsEnum, logAnalytics } from '$lib/analytics'
import { courseNumAsDecimal } from '$lib/helpers'
import { useSearchStore } from '$stores/search'
import type { AACourse, Section } from '$lib/peterportal.types'
import { useScheduleStore } from '.'
import type { Course } from '.'

const arrayOfColors = Object.values(colors).map((c) => ('black' in c ? c.black : c[500]))

/**
 * AACourse without the "sections" property
 */
type SimpleAACourse = Omit<AACourse, 'sections'>

/**
 * after the function runs, it can execute the appropriate callbck if provided
 */
interface Options {
  onSuccess?: (course: Course | undefined, index: number) => void
  onError?: (error: Error) => void
}

/**
 * add a course to a schedule
 * @param section
 * @param course AACourse with missing properties
 * @param addScheduleIndex index of schedule in the array to target
 * @param save whether we can undo the changes
 */
export function addCourse(section: Section, course: SimpleAACourse, addScheduleIndex?: number, options?: Options) {
  const { form } = useSearchStore.getState()
  const { schedules, scheduleIndex, previousStates } = useScheduleStore.getState()

  const targetScheduleIndex = addScheduleIndex ?? scheduleIndex
  const allCourses = schedules.map((schedule) => schedule?.courses).flat(1)

  const existingCourse = allCourses.find(
    (course) => course.section.sectionCode === section.sectionCode && course.term === form.term
  )

  if (existingCourse) {
    options?.onError?.(new Error('Course already exists in schedule'))
    return
  }

  const setOfUsedColors = new Set(allCourses.map((course) => course.section.color))
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
  useScheduleStore.setState({ schedules, previousStates })

  options?.onSuccess?.(newCourse, scheduleIndex)

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
export function addCourseToAllSchedules(section: Section, course: SimpleAACourse, options?: Options) {
  const { schedules } = useScheduleStore.getState()
  schedules.forEach((_schedule, index) => addCourse(section, course, index, options))
}

/**
 * change a course's color
 * @remarks logging Google Analytics will be done from the component
 * @param sectionCode section code
 * @param term
 * @param newColor color
 */
export function changeCourseColor(sectionCode: string, term: string, newColor: string) {
  const { schedules } = useScheduleStore.getState()
  const allCourses = schedules.map((schedule) => schedule.courses).flat(1)
  const course = allCourses.find((course) => course.section.sectionCode === sectionCode && course.term === term)
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
export function deleteCourse(sectionCode: string, term: string, options?: Options) {
  const { schedules, scheduleIndex, previousStates } = useScheduleStore.getState()
  previousStates.push({ schedules: structuredClone(schedules), scheduleIndex })

  const foundCourse = schedules[scheduleIndex].courses.find(
    (c) => c.section.sectionCode === sectionCode && c.term === term
  )

  schedules[scheduleIndex].courses = schedules[scheduleIndex].courses.filter(
    (course) => !(course.section.sectionCode === sectionCode && course.term === term)
  )

  useScheduleStore.setState({ schedules: structuredClone(schedules), previousStates })

  logAnalytics({
    category: analyticsEnum.addedClasses.title,
    action: analyticsEnum.addedClasses.actions.DELETE_COURSE,
  })

  options?.onSuccess?.(foundCourse, scheduleIndex)
}

/**
 * if schedule index is equal to the length, add all current courses to all other schedules
 * otherwise add all current courses to the target schedule
 * @param toScheduleIndex index of the other schedule
 */
export function copyCoursesToSchedule(toScheduleIndex: number, options?: Options) {
  const { schedules, scheduleIndex } = useScheduleStore.getState()
  if (toScheduleIndex === schedules.length) {
    schedules[scheduleIndex].courses.forEach((course) => {
      addCourseToAllSchedules(course.section, course)
    })
  } else {
    schedules[scheduleIndex].courses.forEach((course) => addCourse(course.section, course, toScheduleIndex))
  }

  logAnalytics({
    category: analyticsEnum.addedClasses.title,
    action: analyticsEnum.addedClasses.actions.COPY_SCHEDULE,
  })

  options?.onSuccess?.(schedules[scheduleIndex].courses[0], toScheduleIndex)
}

/**
 * restore the latest state from the saved states
 */
export function undo(options?: Options) {
  const { scheduleIndex, previousStates } = useScheduleStore.getState()
  const lastState = previousStates.pop() || { schedules: [], scheduleIndex }
  useScheduleStore.setState({ schedules: lastState.schedules, previousStates })

  logAnalytics({
    category: analyticsEnum.calendar.title,
    action: analyticsEnum.calendar.actions.UNDO,
  })

  options?.onSuccess?.(lastState.schedules[lastState.scheduleIndex].courses[0], scheduleIndex)
}
