import { useState } from 'react'
import { Box, IconButton, Popover, ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material'
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  SettingsOutlined as SettingsIcon,
  SettingsBrightness as SettingsBrightnessIcon,
} from '@mui/icons-material'
import { analyticsEnum, logAnalytics } from '$lib/analytics'
import useSettingsStore from '$stores/settings'

/**
 * icon button to open settings drawer
 */
export default function Settings() {
  const { colorScheme, setColorScheme } = useSettingsStore()
  const [anchorEl, setAnchorEl] = useState<Element>()

  const handleOpen = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(undefined)
  }

  /**
   * update the global color scheme when a radio button is clicked
   */
  const handleChange = (_e: React.MouseEvent<HTMLElement, MouseEvent>, value: string) => {
    setColorScheme(value)
    logAnalytics({
      category: analyticsEnum.nav.title,
      action: analyticsEnum.nav.actions.CHANGE_THEME,
      label: value,
    })
  }

  return (
    <>
      <Tooltip title="Settings">
        <IconButton onClick={handleOpen}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box sx={{ p: 2, '& .MuiSvgIcon-root': { mr: 1 } }}>
          <ToggleButtonGroup exclusive fullWidth value={colorScheme} onChange={handleChange}>
            <ToggleButton value="light">
              <LightModeIcon fontSize="small" />
              Light
            </ToggleButton>
            <ToggleButton value="dark">
              <DarkModeIcon fontSize="small" />
              Dark
            </ToggleButton>
            <ToggleButton value="auto">
              <SettingsBrightnessIcon fontSize="small" />
              Auto
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Popover>
    </>
  )
}
