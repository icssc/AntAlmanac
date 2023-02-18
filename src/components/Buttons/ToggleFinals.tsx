import { Button } from '@mui/material'
import analyticsEnum, { logAnalytics } from '$lib/analytics'
import { useSettingsStore } from '$stores/settings'

/**
 * toggles the website's "viewing finals" state
 */
export default function ToggleFinalsButton() {
  const { showFinals, setShowFinals } = useSettingsStore()

  function handleClick() {
    logAnalytics({
      category: analyticsEnum.calendar.title,
      action: analyticsEnum.calendar.actions.DISPLAY_FINALS,
    })
    setShowFinals(!showFinals)
  }

  return (
    <Button
      onClick={handleClick}
      color={showFinals ? 'primary' : 'inherit'}
      variant={showFinals ? 'contained' : 'outlined'}
    >
      Finals
    </Button>
  )
}
