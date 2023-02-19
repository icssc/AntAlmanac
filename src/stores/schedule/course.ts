/**
 * functions that manage courses in the schedule store
 * @remarks be careful with previousStates;
 * structuredClone is used to deep clone the object so it doesn't get affected by mutations to the original
 */

import * as colors from '@mui/material/colors'
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
 * add a course to a schedule
 * @param section
 * @param course AACourse with missing properties
 * @param addScheduleIndex index of schedule in the array to target
 * @param save whether we can undo the changes
 */
export function addCourse(section: Section, course: SimpleAACourse, addScheduleIndex?: number, save = true) {
  const { form } = useSearchStore.getState()
  const { schedules, scheduleIndex, previousStates } = useScheduleStore.getState()

  const targetScheduleIndex = addScheduleIndex ?? scheduleIndex
  const allCourses = schedules.map((schedule) => schedule?.courses).flat(1)

  const existingCourse = allCourses.find(
    (course) => course.section.sectionCode === section.sectionCode && course.term === form.term
  )

  if (existingCourse) {
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

  if (save) {
    previousStates.push({ schedules: oldSchedules, scheduleIndex })
    useScheduleStore.setState({ schedules, previousStates })
  }
}

/**
 * save a course to all schedules
 * @param section
 * @param course
 * @param save whether to immediately commit these changes
 */
export function addCourseToAllSchedules(section: Section, course: SimpleAACourse) {
  const { schedules } = useScheduleStore.getState()
  schedules.forEach((_schedule, index) => addCourse(section, course, index))
}

/**
 * change a course's color
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
export function deleteCourse(sectionCode: string, term: string) {
  const { schedules, scheduleIndex, previousStates } = useScheduleStore.getState()
  previousStates.push({ schedules: structuredClone(schedules), scheduleIndex })
  schedules[scheduleIndex].courses = schedules[scheduleIndex].courses.filter(
    (course) => !(course.section.sectionCode === sectionCode && course.term === term)
  )
  useScheduleStore.setState({ schedules: structuredClone(schedules), previousStates })
}

/**
 * if schedule index is equal to the length, add all current courses to all other schedules
 * otherwise add all current courses to the target schedule
 * @param toScheduleIndex index of the other schedule
 */
export function copyCoursesToSchedule(toScheduleIndex: number) {
  const { schedules, scheduleIndex } = useScheduleStore.getState()

  if (toScheduleIndex === schedules.length) {
    schedules[scheduleIndex].courses.forEach((course) => {
      addCourseToAllSchedules(course.section, course)
    })
  } else {
    schedules[scheduleIndex].courses.forEach((course) => addCourse(course.section, course, toScheduleIndex))
  }
}

/**
 * restore the latest state from the saved states
 */
export function undo() {
  const { scheduleIndex, previousStates } = useScheduleStore.getState()
  const lastState = previousStates.pop() || { schedules: [], scheduleIndex }
  useScheduleStore.setState({ schedules: lastState.schedules, previousStates })
}
