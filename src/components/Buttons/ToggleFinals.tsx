import { Button } from '@mui/material';
import { analyticsEnum, logAnalytics } from '$lib/analytics';
import { useSettingsStore } from '$stores/settings';

/**
 * button that can toggle the finals state of the settings store
 */
export default function ToggleFinalsButton() {
  const showFinals = useSettingsStore((state) => state.showFinals);
  const setShowFinals = useSettingsStore((state) => state.setShowFinals);

  function handleClick() {
    logAnalytics({
      category: analyticsEnum.calendar.title,
      action: analyticsEnum.calendar.actions.DISPLAY_FINALS,
    });
    setShowFinals(!showFinals);
  }

  return (
    <Button
      onClick={handleClick}
      color={showFinals ? 'primary' : 'inherit'}
      variant={showFinals ? 'contained' : 'outlined'}
    >
      Finals
    </Button>
  );
}
