import { PETERPORTAL_WEBSOC_ENDPOINT, WEBSOC_ENDPOINT } from '../../api/endpoints'
import type { Meeting, Section, WebsocResponse } from '../../peterportal.types'

export interface CourseDetails {
  deptCode: string
  courseNumber: string
  courseTitle: string
  courseComment: string
  prerequisiteLink: string
}

interface CourseInfo {
  courseDetails: CourseDetails
  section: Section
}

export function getCourseInfo(SOCObject: WebsocResponse) {
  const courseInfo: { [sectionCode: string]: CourseInfo } = {}
  for (const school of SOCObject.schools) {
    for (const department of school.departments) {
      for (const course of department.courses) {
        for (const section of course.sections) {
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
        }
      }
    }
  }
  return courseInfo
}

export function combineSOCObjects(SOCObjects: WebsocResponse[]) {
  const combined = SOCObjects.shift() as WebsocResponse
  for (const res of SOCObjects) {
    for (const school of res.schools) {
      const schoolIndex = combined.schools.findIndex((s) => s.schoolName === school.schoolName)
      if (schoolIndex !== -1) {
        for (const dept of school.departments) {
          const deptIndex = combined.schools[schoolIndex].departments.findIndex((d) => d.deptCode === dept.deptCode)
          if (deptIndex !== -1) {
            const courses = new Set(combined.schools[schoolIndex].departments[deptIndex].courses)
            for (const course of dept.courses) {
              courses.add(course)
            }
            const coursesArray = Array.from(courses)
            coursesArray.sort(
              (left, right) =>
                parseInt(left.courseNumber.replace(/\D/g, '')) - parseInt(right.courseNumber.replace(/\D/g, ''))
            )
            combined.schools[schoolIndex].departments[deptIndex].courses = coursesArray
          } else {
            combined.schools[schoolIndex].departments.push(dept)
          }
        }
      } else {
        combined.schools.push(school)
      }
    }
  }
  return combined
}

interface CacheEntry extends WebsocResponse {
  timestamp: number
}

const websocCache: { [key: string]: CacheEntry } = {}

export function clearCache() {
  Object.keys(websocCache).forEach((key) => delete websocCache[key]) //https://stackoverflow.com/a/19316873/14587004
}

export async function queryWebsoc(params: Record<string, string>): Promise<WebsocResponse> {
  // Construct a request to PeterPortal with the params as a query string
  const url = new URL(PETERPORTAL_WEBSOC_ENDPOINT)
  const searchString = new URLSearchParams(params).toString()
  if (websocCache[searchString]?.timestamp > Date.now() - 30 * 60 * 1000) {
    //NOTE: Check out how caching works
    //if cache hit and less than 30 minutes old
    return websocCache[searchString]
  }
  url.search = searchString

  //The data from the API will duplicate a section if it has multiple locations.
  //I.e., if there's a Tuesday section in two different (probably adjoined) rooms,
  //courses[i].sections[j].meetings will have two entries, despite it being the same section.
  //For now, I'm correcting it with removeDuplicateMeetings, but the API should handle this

  try {
    const response = (await fetch(url).then((r) => r.json())) as WebsocResponse
    websocCache[searchString] = { ...response, timestamp: Date.now() }
    return removeDuplicateMeetings(response)
  } catch {
    const backupResponse = (await fetch(WEBSOC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }).then((res) => res.json())) as WebsocResponse
    websocCache[searchString] = { ...backupResponse, timestamp: Date.now() }
    return removeDuplicateMeetings(backupResponse)
  }
}

// Removes duplicate meetings as a result of multiple locations from WebsocResponse.
// See queryWebsoc for more info
// NOTE: The separator is currently an ampersand. Maybe it should be refactored to be an array
// TODO: Remove if and when API is fixed
// Maybe put this into CourseRenderPane.tsx -> flattenSOCObject()
function removeDuplicateMeetings(websocResp: WebsocResponse): WebsocResponse {
  websocResp.schools.forEach((school, schoolIndex) => {
    school.departments.forEach((department, departmentIndex) => {
      department.courses.forEach((course, courseIndex) => {
        course.sections.forEach((section, sectionIndex) => {
          // Merge meetings that have the same meeting day and time

          const existingMeetings: Meeting[] = []

          // I know that this is n^2, but a section can't have *that* many locations
          for (const meeting of section.meetings) {
            let isNewMeeting = true

            for (let i = 0; i < existingMeetings.length; i++) {
              const sameDayAndTime =
                meeting.days === existingMeetings[i].days && meeting.time === existingMeetings[i].time
              const sameBuilding = meeting.bldg === existingMeetings[i].bldg

              //This shouldn't be possible because there shouldn't be duplicate locations in a section
              if (sameDayAndTime && sameBuilding) {
                console.warn('Found two meetings with same days, time, and bldg', websocResp)
                break
              }

              // Add the building to existing meeting instead of creating a new one
              if (sameDayAndTime && !sameBuilding) {
                existingMeetings[i] = {
                  days: existingMeetings[i].days,
                  time: existingMeetings[i].time,
                  bldg: existingMeetings[i].bldg + ' & ' + meeting.bldg,
                }
                isNewMeeting = false
              }
            }

            if (isNewMeeting) existingMeetings.push(meeting)
          }

          // Update websocResp with correct meetings
          websocResp.schools[schoolIndex].departments[departmentIndex].courses[courseIndex].sections[
            sectionIndex
          ].meetings = existingMeetings
        })
      })
    })
  })
  return websocResp
}
