import { Fragment, useState } from 'react'
import {
  Brightness4 as Brightness4Icon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  SettingsBrightness as SettingsBrightnessIcon,
} from '@mui/icons-material'
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Popover,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material'
import { analyticsEnum, logAnalytics } from '$lib/analytics'
import { useSettingsStore } from '$stores/settings'

interface Props {
  /**
   * whether this button is in a MUI List and should be a ListItem;
   * otherwise assumed to be in Menu and renders as MenuItem
   */
  listItem?: boolean
}

/**
 * button that opens a popover with a toggle button group to change the color scheme
 */
export default function Settings(props?: Props) {
  const { colorScheme, setColorScheme } = useSettingsStore()
  const [anchorEl, setAnchorEl] = useState<HTMLElement>()

  /**
   * update the global color scheme when a radio button is clicked
   */
  function handleChange(_e: React.MouseEvent<HTMLElement, MouseEvent>, value: string) {
    setColorScheme(value)
    logAnalytics({
      category: analyticsEnum.nav.title,
      action: analyticsEnum.nav.actions.CHANGE_THEME,
      label: value,
    })
  }

  function handleOpen(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(undefined)
  }

  const WrapperElement = props?.listItem ? ListItem : Fragment
  const ClickElement = props?.listItem ? ListItemButton : MenuItem

  return (
    <>
      <WrapperElement>
        <Tooltip title="Edit Theme">
          <ClickElement onClick={handleOpen} dense={!props?.listItem} href="">
            <ListItemIcon>
              <Brightness4Icon />
            </ListItemIcon>
            <ListItemText>Theme</ListItemText>
          </ClickElement>
        </Tooltip>
      </WrapperElement>

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Paper sx={{ padding: '0.5rem', minWidth: '12.25rem' }}>
          <ToggleButtonGroup orientation="vertical" exclusive fullWidth value={colorScheme} onChange={handleChange}>
            <ToggleButton value="light" sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <LightModeIcon />
              Light
            </ToggleButton>
            <ToggleButton value="dark" sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <DarkModeIcon />
              Dark
            </ToggleButton>
            <ToggleButton value="auto" sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <SettingsBrightnessIcon />
              Auto
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>
      </Popover>
    </>
  )
}
