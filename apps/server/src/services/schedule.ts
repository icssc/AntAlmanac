import fetch from 'node-fetch'
import type { SavedSchedule } from '@packages/types'
import type { WebsocAPIResponse, WebsocCourse, WebsocSection } from 'peterportal-api-next-types'

const PETERPORTAL_WEBSOC_ENDPOINT = `https://api.peterportal.org/rest/v0/schedule/soc`

/**
 * query the websocket endpoint
 */
async function queryWebsoc(params: Record<string, string>): Promise<WebsocAPIResponse> {
  const searchParams = new URLSearchParams(params)
  const response = await fetch(`${PETERPORTAL_WEBSOC_ENDPOINT}?${searchParams.toString()}`)
  const data = (await response.json()) as WebsocAPIResponse
  return data
}

interface CourseInfo {
  courseDetails: Omit<WebsocCourse, 'sections'>
  section: WebsocSection
}

/**
 * get course info from a websocket response
 */
function getCourseInfo(SOCObject: WebsocAPIResponse) {
  const courseInfo: Record<string, CourseInfo> = {}
  SOCObject.schools.forEach((school) => {
    school.departments.forEach((department) => {
      department.courses.forEach((course) => {
        course.sections.forEach((section) => {
          courseInfo[section.sectionCode] = {
            courseDetails: {
              deptCode: department.deptCode,
              courseNumber: course.courseNumber,
              courseTitle: course.courseTitle,
              courseComment: course.courseComment,
              prerequisiteLink: course.prerequisiteLink,
            },
            section: section,
          }
        })
      })
    })
  })
  return courseInfo
}

/**
 * generate a full schedule from a saved, short schedule
 */
async function generateFullSchedule(saveState: SavedSchedule) {
  const uniqueSectionsPerTerm: Record<string, Set<string>> = {}
  const courseInfoPerTerm = new Map<string, Record<string, CourseInfo>>()

  saveState.schedules.forEach((schedule) => {
    schedule.courses.forEach((course) => {
      if (course.term in uniqueSectionsPerTerm) {
        uniqueSectionsPerTerm[course.term].add(course.sectionCode)
      } else {
        uniqueSectionsPerTerm[course.term] = new Set([course.sectionCode])
      }
    })
  })

  await Promise.all(
    Object.entries(uniqueSectionsPerTerm).map(async ([term, courseSet]) => {
      const response = await queryWebsoc({ term, sectionCodes: [...courseSet].join(',') })
      const courseInfo = getCourseInfo(response)
      courseInfoPerTerm.set(term, courseInfo)
    })
  )

  const schedules = saveState.schedules.map((schedule) => {
    const hydratedCourses = 
      schedule.courses
        .map((course) => ({ short: course, info: courseInfoPerTerm.get(course.term) }))
        .filter((course) => course.info != null)
        .map((course) => {
          const courseInfoMap = course.info?.[course.short.sectionCode]
          return {
            ...course.short,
            ...courseInfoMap?.courseDetails,
            section: {
              ...courseInfoMap?.section,
              color: course.short.color,
            },
          }
        })
      return {
        ...schedule,
        courses: hydratedCourses,
      }
  })

  return {
    schedules: schedules.flat(),
    scheduleIndex: saveState.scheduleIndex,
  }
}

export default generateFullSchedule
