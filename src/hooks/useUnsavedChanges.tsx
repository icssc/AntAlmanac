import { useScheduleStore } from '$stores/schedule'
import { useEffect } from 'react'

function handleBeforeUnload(e: BeforeUnloadEvent) {
  e.returnValue = `Are you sure you want to leave? You have unsaved changes!`
}

export default function useUnsavedChanges() {
  const { saved } = useScheduleStore()

  /**
   * whenever save state changes, re-apply the event listener
   */
  useEffect(() => {
    if (!saved) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [saved])
}
