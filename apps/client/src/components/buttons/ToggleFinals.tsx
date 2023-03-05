import { Button, Tooltip } from '@mui/material'
import { analyticsEnum, logAnalytics } from '$lib/analytics'
import useSettingsStore from '$stores/settings'

/**
 * button that can toggle the finals state of the settings store
 */
export default function ToggleFinalsButton() {
  const showFinals = useSettingsStore((store) => store.showFinals)
  const setShowFinals = useSettingsStore((store) => store.setShowFinals)

  const handleClick = () => {
    logAnalytics({
      category: analyticsEnum.calendar.title,
      action: analyticsEnum.calendar.actions.DISPLAY_FINALS,
    })
    setShowFinals(!showFinals)
  }

  return (
    <Tooltip title="Toggle Finals Schedule">
      <Button
        onClick={handleClick}
        color={showFinals ? 'primary' : 'inherit'}
        variant={showFinals ? 'contained' : 'outlined'}
      >
        Finals
      </Button>
    </Tooltip>
  )
}
