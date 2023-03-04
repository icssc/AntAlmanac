import fetch from 'node-fetch'
import type { Meeting, WebsocResponse } from '@packages/peterportal'
import type { CourseInfo, ScheduleSaveState } from '@packages/schemas/schedule'

const apiBaseUrl = 'https://dev.api.antalmanac.com'
const WEBSOC_ENDPOINT = `${apiBaseUrl}/api/websocapi`
const PETERPORTAL_WEBSOC_ENDPOINT = `https://api.peterportal.org/rest/v0/schedule/soc`

/**
 * Removes duplicate meetings as a result of multiple locations from WebsocResponse.
 * See queryWebsoc for more info
 * NOTE: The separator is currently an ampersand. Maybe it should be refactored to be an array
 * TODO: Remove if and when API is fixed
 */
function removeDuplicateMeetings(websocResp: WebsocResponse): WebsocResponse {
  const response = websocResp
  websocResp.schools.forEach((school, schoolIndex) => {
    school.departments.forEach((department, departmentIndex) => {
      department.courses.forEach((course, courseIndex) => {
        course.sections.forEach((section, sectionIndex) => {
          // Merge meetings that have the same meeting day and time
          const existingMeetings: Meeting[] = []

          for (const meeting of section.meetings) {
            let isNewMeeting = true

            for (let i = 0; i < existingMeetings.length; i += 1) {
              const sameDayAndTime =
                meeting.days === existingMeetings[i].days && meeting.time === existingMeetings[i].time
              const sameBuilding = meeting.bldg === existingMeetings[i].bldg

              // This shouldn't be possible because there shouldn't be duplicate locations in a section
              if (sameDayAndTime && sameBuilding) {
                console.warn('Found two meetings with same days, time, and bldg', websocResp)
                break
              }

              // Add the building to existing meeting instead of creating a new one
              if (sameDayAndTime && !sameBuilding) {
                existingMeetings[i] = {
                  days: existingMeetings[i].days,
                  time: existingMeetings[i].time,
                  bldg: `${existingMeetings[i].bldg} & ${meeting.bldg}`,
                }
                isNewMeeting = false
              }
            }

            if (isNewMeeting) existingMeetings.push(meeting)
          }

          // Update websocResp with correct meetings
          response.schools[schoolIndex].departments[departmentIndex].courses[courseIndex].sections[
            sectionIndex
          ].meetings = existingMeetings
        })
      })
    })
  })
  return response
}

/**
 * query the websocket endpoint
 */
async function queryWebsoc(params: Record<string, string>): Promise<WebsocResponse> {
  const searchParams = new URLSearchParams(params)
  const url = `${PETERPORTAL_WEBSOC_ENDPOINT}?${searchParams.toString()}`

  /**
   * The data from the API will duplicate a section if it has multiple locations.
   * i.e., if there's a Tuesday section in two different (probably adjoined) rooms,
   * courses[i].sections[j].meetings will have two entries, despite it being the same section.
   * For now, I'm correcting it with removeDuplicateMeetings, but the API should handle this
   */
  try {
    const response = (await fetch(url.toString()).then((r) => r.json())) as WebsocResponse
    return removeDuplicateMeetings(response)
  } catch {
    const backupResponse = (await fetch(WEBSOC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }).then((res) => res.json())) as WebsocResponse
    return removeDuplicateMeetings(backupResponse)
  }
}

/**
 * get course info from a websocket response
 */
function getCourseInfo(SOCObject: WebsocResponse) {
  const courseInfo: Record<string, CourseInfo> = {}
  SOCObject.schools.forEach(school => {
    school.departments.forEach(department => {
      department.courses.forEach(course => {
        course.sections.forEach(section => {
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

async function generateFullSchedule(saveState: ScheduleSaveState) {
  const uniqueSectionsPerTerm: Record<string, Set<string>> = {}
  const courseInfoDict = new Map<string, Record<string, CourseInfo>>()

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
      courseInfoDict.set(term, getCourseInfo(response))
    })
  )

  const schedules = saveState.schedules.map((schedule) =>
    schedule.courses
      .map((course) => ({ short: course, info: courseInfoDict.get(course.term) }))
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
  )
  const flattenedSchedules = schedules.flat()
  return flattenedSchedules
}

export default generateFullSchedule
