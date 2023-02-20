import { useEffect } from 'react'
import { useSnackbar } from 'notistack'
import { loadSchedule } from '$stores/schedule/load'

/**
 * load the user's schedule if the userId is in local storage
 * has to be in a component UNDER the snackbar provider, i.e. home page
 */
export default function useInitializeSchedule() {
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    const userID = window.localStorage.getItem('userID')
    if (userID != null) {
      loadSchedule(userID, true, {
        onSuccess() {
          enqueueSnackbar(`Schedule for user ${userID} loaded!`, { variant: 'success' })
        },
        onError(error) {
          enqueueSnackbar(error.message, { variant: 'error' })
        },
      })
    }
  }, [])

  return null
}
