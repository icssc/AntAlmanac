import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import { PETERPORTAL_WEBSOC_ENDPOINT, WEBSOC_ENDPOINT } from '$lib/api/endpoints'
import type { Meeting, WebsocResponse } from '$lib/peterportal.types'

/**
 * does fetch request to websoc api
 */
export async function queryWebsoc(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params)
  const url = `${PETERPORTAL_WEBSOC_ENDPOINT}?${searchParams.toString()}`
  try {
    const response: WebsocResponse = await fetch(url).then((res) => res.json())
    return removeDuplicateMeetings(response)
  } catch {
    const backupResponse: WebsocResponse = await fetch(WEBSOC_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }).then((res) => res.json())
    return removeDuplicateMeetings(backupResponse)
  }
}

/**
 * Removes duplicate meetings as a result of multiple locations from WebsocResponse.
 * See queryWebsoc for more info
 * NOTE: The separator is currently an ampersand. Maybe it should be refactored to be an array
 * TODO: Remove if and when API is fixed
 */
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

/**
 * combines multiple responses from websoc API in batching mode
 */
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

type WebsocQueryOptions = UseQueryOptions<WebsocResponse, any, WebsocResponse, any>

/**
 * hook to query websoc api
 */
export function useWebsocQuery(params: any, options?: WebsocQueryOptions) {
  const query = useQuery([PETERPORTAL_WEBSOC_ENDPOINT, ...Object.keys(params), ...Object.values(params)], {
    async queryFn() {
      const response = await queryWebsoc(params)
      return response
    },
    ...options,
  })
  return query
}

/**
 * hook to query websoc api in batching mode
 */
export function useWebsocQueryMultiple(
  params: Record<string, string>,
  fieldName: string,
  options?: WebsocQueryOptions
) {
  const query = useQuery([PETERPORTAL_WEBSOC_ENDPOINT, ...Object.keys(params), ...Object.values(params)], {
    async queryFn() {
      const responses: WebsocResponse[] = []
      for (const field of params[fieldName].trim().replace(' ', '').split(',')) {
        const req = JSON.parse(JSON.stringify(params)) as Record<string, string>
        req[fieldName] = field
        responses.push(await queryWebsoc(req))
      }

      return combineSOCObjects(responses)
    },
    ...options,
  })
  return query
}
