import type { Schedule, ShortCourseSchedule } from '@packages/schemas/schedule'
import { SAVE_DATA_ENDPOINT } from '$lib/api/endpoints'
import { analyticsEnum, logAnalytics } from '$lib/analytics'
import { useScheduleStore } from '.'

/*
 * convert schedule to shortened schedule (no course info) for saving.
 */
export function convertSchedulesToSave(schedules: Schedule[]) {
  const shortSchedules: ShortCourseSchedule[] = schedules.map((schedule) => ({
    scheduleName: schedule.scheduleName,
    customEvents: schedule.customEvents,
    courses: schedule.courses.map((course) => ({
      color: course.section.color,
      term: course.term,
      sectionCode: course.section.sectionCode,
    })),
  }))
  return { schedules: shortSchedules, scheduleIndex: 0 }
}

interface Options {
  onSuccess?: () => void
  onError?: () => void
}

/**
 * saves the current schedule
 */
export async function saveSchedule(userID: string, rememberMe: boolean, options?: Options) {
  logAnalytics({
    category: analyticsEnum.nav.title,
    action: analyticsEnum.nav.actions.SAVE_SCHEDULE,
    label: userID,
    value: rememberMe ? 1 : 0,
  })

  if (!userID) {
    return
  }

  const { schedules } = useScheduleStore.getState()

  if (rememberMe) {
    window.localStorage.setItem('userID', userID)
  } else {
    window.localStorage.removeItem('userID')
  }

  try {
    if (!schedules) {
      throw new Error('No schedule to save')
    }

    const userData = convertSchedulesToSave(schedules)

    await fetch(SAVE_DATA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userID, userData }),
    })

    useScheduleStore.setState({ saved: true })
    options?.onSuccess?.()
  } catch (e) {
    console.log(e)
    options?.onError?.()
  }
}
