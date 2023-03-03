import { useState } from 'react'
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Settings as SettingsIcon,
  SettingsBrightness as SettingsBrightnessIcon,
} from '@mui/icons-material'
import { analyticsEnum, logAnalytics } from '$lib/analytics'
import useSettingsStore from '$stores/settings'

/**
 * icon button to open settings drawer
 */
export default function Settings() {
  const { colorScheme, setColorScheme } = useSettingsStore()
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
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

      <Drawer anchor="right" open={open} onClose={handleClose}>
        <Paper sx={{ height: 1 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" fontWeight="600">
              Settings
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ px: 4, '& .MuiSvgIcon-root': { mr: 1 } }}>
            <Typography variant="body1" sx={{ my: 2 }}>
              Mode
            </Typography>
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
        </Paper>
      </Drawer>
    </>
  )
}
