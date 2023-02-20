/**
 * functions for getting saved schedules
 */

import { PETERPORTAL_WEBSOC_ENDPOINT, WEBSOC_ENDPOINT, LOAD_DATA_ENDPOINT } from '$lib/api/endpoints'
import type { Meeting, WebsocResponse } from '$lib/peterportal.types'
import { analyticsEnum, logAnalytics } from '$lib/analytics'
import { useScheduleStore } from '.'
import type { Course, CourseInfo, RepeatingCustomEvent, ScheduleSaveState, ShortCourse } from '.'

interface LegacyShortCourseInfo extends ShortCourse {
  scheduleIndices: number[]
}

interface LegacyRepeatingCustomEvent extends RepeatingCustomEvent {
  scheduleIndices: number[]
}

interface LegacyUserData {
  addedCourses: LegacyShortCourseInfo[]
  scheduleNames: string[]
  customEvents: LegacyRepeatingCustomEvent[]
}

/**
 * get course info from a websocket response
 */
function getCourseInfo(SOCObject: WebsocResponse) {
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

          for (const meeting of section.meetings) {
            let isNewMeeting = true

            for (let i = 0; i < existingMeetings.length; i++) {
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
 * query the websocket endpoint
 */
async function queryWebsoc(params: Record<string, string>): Promise<WebsocResponse> {
  const url = new URL(PETERPORTAL_WEBSOC_ENDPOINT)
  const searchString = new URLSearchParams(params).toString()
  url.search = searchString

  // The data from the API will duplicate a section if it has multiple locations.
  // i.e., if there's a Tuesday section in two different (probably adjoined) rooms,
  // courses[i].sections[j].meetings will have two entries, despite it being the same section.
  // For now, I'm correcting it with removeDuplicateMeetings, but the API should handle this

  try {
    const response = (await fetch(url).then((r) => r.json())) as WebsocResponse
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

interface Options {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * load schedule
 */
export async function loadSchedule(userID: string, rememberMe?: boolean, options?: Options) {
  const { saved } = useScheduleStore.getState()

  logAnalytics({
    category: analyticsEnum.nav.title,
    action: analyticsEnum.nav.actions.LOAD_SCHEDULE,
    label: userID,
    value: rememberMe ? 1 : 0,
  })

  if (
    userID != null &&
    (!saved || window.confirm(`Are you sure you want to load a different schedule? You have unsaved changes!`))
  ) {
    userID = userID.replace(/\s+/g, '')
    if (!userID) {
      return
    }
    if (rememberMe) {
      window.localStorage.setItem('userID', userID)
    } else {
      window.localStorage.removeItem('userID')
    }

    try {
      let response_data = await fetch(LOAD_DATA_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: userID }),
      })

      const json = (await response_data.json()) as { userData: ScheduleSaveState }
      const scheduleSaveState = json.userData

      if (!scheduleSaveState) {
        return
      }

      if (await fromScheduleSaveState(scheduleSaveState)) {
        options?.onSuccess?.()
        return
      }

      if (await fromScheduleSaveState(convertLegacySchedule(scheduleSaveState as any))) {
        options?.onSuccess?.()
        return
      }
      /**
       * Finally try getting and loading from legacy if none of the above works
       * TODO: should be legacy endpoint
       */
      response_data = await fetch(LOAD_DATA_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: userID }),
      })

      const json2 = (await response_data.json()) as { userData: LegacyUserData }
      const legacyUserData = json2.userData
      if (!legacyUserData || (await fromScheduleSaveState(convertLegacySchedule(legacyUserData)))) {
        options?.onSuccess?.()
        return
      }
      options?.onError?.(new Error(`Couldn't find schedules for username "${userID}".`))
    } catch (e) {
      options?.onError?.(new Error('Encountered network error while loading schedules.'))
    }
  }
}

/**
 * overwrite the current schedule with the provided save state.
 */
async function fromScheduleSaveState(saveState: ScheduleSaveState) {
  const { schedules, scheduleIndex, previousStates } = useScheduleStore.getState()

  previousStates.push({ schedules: structuredClone(schedules), scheduleIndex })

  try {
    schedules.length = 0
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

    useScheduleStore.setState({ schedules, scheduleIndex, previousStates, saved: false })
    return true
  } catch (e) {
    console.log(e)
    return false
  }
}

/**
 * convert a legacy schedule
 */
function convertLegacySchedule(legacyUserData: LegacyUserData) {
  const scheduleSaveState: ScheduleSaveState = { schedules: [], scheduleIndex: 0 }
  for (const scheduleName of legacyUserData.scheduleNames) {
    scheduleSaveState.schedules.push({ scheduleName: scheduleName, courses: [], customEvents: [] })
  }
  for (const course of legacyUserData.addedCourses) {
    for (const scheduleIndex of course.scheduleIndices) {
      scheduleSaveState.schedules[scheduleIndex].courses.push({ ...course })
    }
  }
  for (const customEvent of legacyUserData.customEvents) {
    for (const scheduleIndex of customEvent.scheduleIndices) {
      scheduleSaveState.schedules[scheduleIndex].customEvents.push({ ...customEvent })
    }
  }
  return scheduleSaveState
}
