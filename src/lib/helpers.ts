import { useScheduleStore } from '$stores/schedule'
import { WEBSOC_ENDPOINT, PETERPORTAL_WEBSOC_ENDPOINT } from '$lib/api/endpoints'
import type { AACourse, AASection, Department, Meeting, Section, School, WebsocResponse } from '$lib/peterportal.types'

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
  const courseInfo: Record<string, CourseInfo> = {}
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

/**
 * flattens the websoc response
 */
export function flattenSOCObject(SOCObject: WebsocResponse) {
  const { schedules, scheduleIndex } = useScheduleStore.getState()

  const courses = schedules[scheduleIndex]?.courses || []

  const courseColors = courses.reduce((accumulator, { section }) => {
    accumulator[section.sectionCode] = section.color
    return accumulator
  }, {} as Record<string, string>)

  const reduced = SOCObject?.schools?.reduce((accumulator, school) => {
    accumulator.push(school)
    school.departments.forEach((dept) => {
      accumulator.push(dept)
      dept.courses.forEach((course) => {
        for (const section of course.sections) {
          ;(section as AASection).color = courseColors[section.sectionCode]
        }
        accumulator.push(course as AACourse)
      })
    })
    return accumulator
  }, [] as (School | Department | AACourse)[])

  return reduced || []
}

/**
 * @param courseNumber string that represents the course number of a course (eg. '122A', '121')
 * @returns int or number with a decimal representation of the passed in string (eg. courseNumAsDecimal('122A') returns 122.1, courseNumAsDecimal('121') returns 121)
 */
export function courseNumAsDecimal(courseNumber: string) {
  // I wanted to split the course detail number into letters and digits
  const courseNumArr = courseNumber.split(/(\d+)/)
  // Gets rid of empty strings in courseNumArr
  const filtered = courseNumArr.filter((value) => value !== '')

  // Return 0 if array is empty
  if (filtered.length === 0) {
    console.error(`No characters were found, returning 0, Input: ${courseNumber}`)
    return 0
  }

  const lastElement = filtered[filtered.length - 1].toUpperCase() // .toUpperCase() won't affect numeric characters
  const lastElementCharCode = lastElement.charCodeAt(0) // Just checks the first character of the last element in the array
  // Return the last element of the filtered array as an integer if it represents an integer
  if ('0'.charCodeAt(0) <= lastElementCharCode && lastElementCharCode <= '9'.charCodeAt(0)) {
    return parseInt(lastElement)
  }

  // If the string does not have any numeric characters
  if (filtered.length === 1) {
    console.error(`The string did not have numbers, returning 0, Input: ${courseNumber}`)
    return 0
  }

  // This element is the second to last element of the array, supposedly a string of numeric characters
  const secondToLastElement = filtered[filtered.length - 2]
  // The characters within [A-I] or [a-i] will be converted to 1-9, respectively
  const letterAsNumber = lastElement.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0) + 1
  if (1 <= letterAsNumber && letterAsNumber <= 9) {
    return parseFloat(`${secondToLastElement}.${letterAsNumber}`)
  } else {
    console.error(
      `The first character type at the end of the string was not within [A-I] or [a-i], returning last numbers found in string, Violating Character: ${
        filtered[filtered.length - 1][0]
      }, Input: ${courseNumber}`
    )
    // This will represent an integer at this point because the split in the beginning split the array into strings of digits and strings of other characters
    // If the last element in the array does not represent an integer, then the second to last element must represent an integer
    return parseInt(secondToLastElement)
  }
}
