import fetch from 'node-fetch'
import { defaultCourseInfo } from '@packages/schemas/schedule'
import type { Course, CourseInfo, ScheduleSaveState } from '@packages/schemas/schedule'
import type { WebsocResponse } from '@packages/peterportal'

const apiBaseUrl = 'https://dev.api.antalmanac.com'
const WEBSOC_ENDPOINT = `${apiBaseUrl}/api/websocapi`
const PETERPORTAL_WEBSOC_ENDPOINT = `https://api.peterportal.org/rest/v0/schedule/soc`

/**
 * query the websocket endpoint
 */
async function queryWebsoc(params: Record<string, string>): Promise<WebsocResponse> {
  const searchParams = new URLSearchParams(params)
  try {
    const response = await fetch(`${PETERPORTAL_WEBSOC_ENDPOINT}?${searchParams.toString()}`)
    const data = await response.json() as WebsocResponse
    return data
  } catch {
    const response = await fetch(WEBSOC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    const data = await response.json() as WebsocResponse
    return data
  }
}

/**
 * get course info from a websocket response
 */
function getCourseInfo(SOCObject: WebsocResponse) {
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

async function generateFullSchedule(saveState: ScheduleSaveState): Promise<Course[]> {
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
      const response = await queryWebsoc({ term, sectionCodes: Array.from(courseSet).join(',') })
      courseInfoPerTerm.set(term, getCourseInfo(response))
    })
  )

  const schedules = saveState.schedules.map((schedule) =>
    schedule.courses
      .map((course) => ({ short: course, info: courseInfoPerTerm.get(course.term) }))
      .filter((course) => course.info != null)
      .map((course) => {
        const courseInfoMap = course.info?.[course.short.sectionCode] || structuredClone(defaultCourseInfo)
        return {
          ...course.short,
          ...courseInfoMap?.courseDetails,
          section: {
            ...courseInfoMap?.section,
            color: course.short.color,
          },
        }
      })
  )
  const flattenedSchedules = schedules.flat()
  return flattenedSchedules
}

export default generateFullSchedule
