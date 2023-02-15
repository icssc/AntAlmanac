/**
 * functions that manage courses in the schedule store
 * @remarks be careful with previousStates;
 * structuredClone is used to deep clone the object so it doesn't get affected by mutations to the original
 */

import {
  amber,
  blue,
  blueGrey,
  cyan,
  deepPurple,
  green,
  indigo,
  lightGreen,
  lime,
  pink,
  purple,
  red,
  teal,
} from '@mui/material/colors'
import { useSearchStore } from '$stores/search'
import type { AACourse, Section } from '$types/peterportal'
import { useScheduleStore } from '.'

const arrayOfColors = [
  red[500],
  pink[500],
  purple[500],
  indigo[500],
  deepPurple[500],
  blue[500],
  green[500],
  cyan[500],
  teal[500],
  lightGreen[500],
  lime[500],
  amber[500],
  blueGrey[500],
]

/**
 * doesn't require the "sections" property from AACourse
 */
type SimpleAACourse = Omit<AACourse, 'sections'>

/**
 * add a course to a schedule
 * @param section
 * @param course
 * @param addScheduleIndex index of schedule in the array to target
 * @param undo whether we can undo the changes
 */
export function addCourse(section: Section, course: SimpleAACourse, addScheduleIndex?: number, undo = true) {
  const { form } = useSearchStore.getState()
  const { schedules, scheduleIndex, previousStates } = useScheduleStore.getState()

  const targetScheduleIndex = addScheduleIndex ?? scheduleIndex
  const allCourses = schedules.map((schedule) => schedule?.courses).flat(1)

  /**
   * The color will be set properly in Schedules
   */
  const newCourse = {
    term: form.term,
    deptCode: course.deptCode,
    courseNumber: course.courseNumber,
    courseTitle: course.courseTitle,
    courseComment: course.courseComment,
    prerequisiteLink: course.prerequisiteLink,
    section: { ...section, color: '' },
  }

  /**
   * attempt to find the course to add
   */
  let courseToAdd = allCourses.find(
    (course) => course.section.sectionCode === section.sectionCode && course.term === form.term
  )

  /**
   * create a new course if it didn't exist
   */
  if (!courseToAdd) {
    const setOfUsedColors = new Set(allCourses.map((course) => course.section.color))
    const color = arrayOfColors.find((materialColor) => !setOfUsedColors.has(materialColor)) || '#5ec8e0'
    courseToAdd = {
      ...newCourse,
      section: {
        ...newCourse.section,
        color,
      },
    }
  }

  const courseAlreadyExists = schedules[targetScheduleIndex]?.courses.some(
    (course) => course.section.sectionCode === section.sectionCode && course.term === form.term
  )

  if (!courseAlreadyExists) {
    if (undo) {
      previousStates.push({ schedules: structuredClone(schedules), scheduleIndex })
    }

    schedules[targetScheduleIndex]?.courses.push(courseToAdd)

    /**
     * if the changes can be undone, commit them to the store and update the state,
     */
    if (undo) {
      useScheduleStore.setState({ schedules, previousStates })
    }
  }
  return {
    schedules,
    previousStates,
    schedule: schedules[targetScheduleIndex],
    course: courseToAdd,
  }
}

/**
 * save a course to all schedules
 * @param section
 * @param course
 * @param save whether to immediately commit these changes
 */
export function addCourseToAllSchedules(section: Section, course: SimpleAACourse, save = true) {
  const { schedules } = useScheduleStore.getState()
  const allChanges = schedules.map((_schedule, index) => addCourse(section, course, index, false))
  const newSchedules = allChanges.map((change) => change.schedule)
  if (save) {
    useScheduleStore.setState({ schedules: newSchedules })
  }
  return { schedules: newSchedules }
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
 * copy the current schedule to another schedule
 * @param toScheduleIndex index of the other schedule
 */
export function copyCoursesToSchedule(toScheduleIndex: number) {
  const { schedules, scheduleIndex } = useScheduleStore.getState()

  const targetSchedule = schedules[toScheduleIndex]

  if (toScheduleIndex === schedules.length) {
    /**
     * TODO: convert this to a batch update like below
     */
    schedules[scheduleIndex].courses.map((course) => addCourseToAllSchedules(course.section, course))
  } else {
    const results = schedules[scheduleIndex].courses.map((course) =>
      addCourse(course.section, course, toScheduleIndex, false)
    )

    const resultCourses = results.map((result) => result.course)

    /**
     * add any that don't exist to the current schedule's courses array
     */
    resultCourses.forEach((course) => {
      if (targetSchedule.courses.find((c) => c.section.sectionCode === course.section.sectionCode)) {
        targetSchedule.courses.push(course)
      }
    })

    /**
     * commit the changes into the store
     */
    useScheduleStore.setState({ schedules })
  }
}

export function undoDelete() {
  const { previousStates } = useScheduleStore.getState()
  const lastState = previousStates.pop()
  if (lastState) {
    useScheduleStore.setState({ schedules: lastState.schedules, previousStates })
  }
}
