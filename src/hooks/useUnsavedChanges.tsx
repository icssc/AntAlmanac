import { useScheduleStore } from '$stores/schedule'
import { useCallback, useEffect } from 'react'

export default function useUnsavedChanges() {
  const { saved } = useScheduleStore()

  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (!saved) {
        e.returnValue = `Are you sure you want to leave? You have unsaved changes!`
      }
    },
    [saved]
  )

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])
}
