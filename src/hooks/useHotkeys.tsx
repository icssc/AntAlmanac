import { useEffect } from 'react'
import { undo, redo } from '$stores/schedule/commands'

/**
 * handles the hotkeys
 */
function handleKeyDown(event: KeyboardEvent) {
  if (event.ctrlKey && event.key === 'z') {
    undo()
  }
  if (event.ctrlKey && event.shiftKey && event.key === 'Z') {
    redo()
  }
}

/**
 * enables the use of hotkeys, e.g. ctrl + z
 */
export default function useHotkeys() {
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
}
