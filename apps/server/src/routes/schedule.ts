import { z } from 'zod'
import { procedure, router } from '../trpc'
import fetch from 'node-fetch'

const LOAD_DATA_ENDPOINT = 'https://dev.api.antalmanac.com/api/users/loadUserData'

const scheduleRouter = router({
  find: procedure.input(z.string()).query(async ({ input }) => {
    const response = await fetch(LOAD_DATA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: input }),
    })

    const data = await response.json()

    return data
  })
})

/**
 * overwrite the current schedule with the provided save state.
 */
async function fromScheduleSaveState(saveState: ScheduleSaveState) {
  try {
    const schedules = []
    const scheduleIndex = saveState.scheduleIndex

    // Get a dictionary of all unique courses
    const courseDict: { [key: string]: Set<string> } = {}
    for (const schedule of saveState.schedules) {
      for (const course of schedule.courses) {
        if (course.term in courseDict) {
          courseDict[course.term].add(course.sectionCode)
        } else {
          courseDict[course.term] = new Set([course.sectionCode])
        }
      }
    }

    // Get the course info for each course
    const courseInfoDict = new Map<string, { [sectionCode: string]: CourseInfo }>()
    console.log({ courseDict })
    for (const [term, courseSet] of Object.entries(courseDict)) {
      const params = {
        term: term,
        sectionCodes: Array.from(courseSet).join(','),
      }
      const jsonResp = await queryWebsoc(params)
      courseInfoDict.set(term, getCourseInfo(jsonResp))
    }

    // Map course info to courses and transform shortened schedule to normal schedule
    for (const shortCourseSchedule of saveState.schedules) {
      const courses: Course[] = []
      for (const shortCourse of shortCourseSchedule.courses) {
        const courseInfoMap = courseInfoDict.get(shortCourse.term)
        if (courseInfoMap !== undefined) {
          const courseInfo = courseInfoMap[shortCourse.sectionCode]
          courses.push({
            ...shortCourse,
            ...courseInfo.courseDetails,
            section: {
              ...courseInfo.section,
              color: shortCourse.color,
            },
          })
        }
      }
      schedules.push({
        ...shortCourseSchedule,
        courses,
      })
    }
    return true
  } catch (e) {
    console.log(e)
    return false
  }
}

export default scheduleRouter
