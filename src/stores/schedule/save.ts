/**
 * functions for saving schedules
 */

import { SAVE_DATA_ENDPOINT } from '$lib/api/endpoints'
import analyticsEnum, { logAnalytics } from '$lib/analytics'
import { useScheduleStore } from '.'
import type { Schedule, ShortCourseSchedule } from '.'

/**
 * save a schedule to the database
 */
export async function saveSchedule(userID: string, rememberMe: boolean) {
    const { schedules } = useScheduleStore.getState()

    logAnalytics({
      category: analyticsEnum.nav.title,
      action: analyticsEnum.nav.actions.SAVE_SCHEDULE,
      label: userID,
      value: rememberMe ? 1 : 0,
    })

    userID = userID.replace(/\s+/g, '')

    if (userID.length > 0) {
      if (rememberMe) {
        window.localStorage.setItem('userID', userID)
      } else {
        window.localStorage.removeItem('userID')
      }

      try {
        const latestSchedule = schedules

        if (!latestSchedule) {
          throw new Error('No schedule to save')
        }

        const userData = convertSchedulesToSave(latestSchedule)

        await fetch(SAVE_DATA_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userID, userData }),
        })

        // enqueueSnackbar(`Schedule saved under username ${userID}. Don't forget to sign up for classes on WebReg!`, {
        //   variant: 'success',
        // })
      } catch (e) {
        // enqueueSnackbar(`Schedule could not be saved under username "${userID}`, { variant: 'error' })
      }
  }
}

/*
 * Convert schedule to shortened schedule (no course info) for saving.
 */
export function convertSchedulesToSave(schedule: Schedule[]) {
  const shortSchedules: ShortCourseSchedule[] = schedule.map((schedule) => {
    return {
      scheduleName: schedule.scheduleName,
      customEvents: schedule.customEvents,
      courses: schedule.courses.map((course) => {
        return {
          color: course.section.color,
          term: course.term,
          sectionCode: course.section.sectionCode,
        }
      }),
    }
  })
  return { schedules: shortSchedules, scheduleIndex: 0 }
}
