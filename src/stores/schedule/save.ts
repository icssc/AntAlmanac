import { useSnackbar } from 'notistack'
import { SAVE_DATA_ENDPOINT } from '$lib/endpoints'
import { analyticsEnum, logAnalytics } from '$lib/analytics'
import { useScheduleStore } from '.'
import { convertSchedulesToSave } from './load'

export function useSaveSchedule() {
  const { enqueueSnackbar } = useSnackbar()

  return async (userID: string, rememberMe: boolean) => {
    const { schedules } = useScheduleStore.getState()

    logAnalytics({
      category: analyticsEnum.nav.title,
      action: analyticsEnum.nav.actions.SAVE_SCHEDULE,
      label: userID,
      value: rememberMe ? 1 : 0,
    })

    if (!userID) {
      return
    }
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

        enqueueSnackbar(`Schedule saved under username ${userID}. Don't forget to sign up for classes on WebReg!`, {
          variant: 'success',
        })

        // AppStore.saveSchedule();
      } catch (e) {
        enqueueSnackbar(`Schedule could not be saved under username "${userID}`, { variant: 'error' })
      }
    }
  }
}
