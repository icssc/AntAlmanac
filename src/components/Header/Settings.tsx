import { useState } from 'react'
import { Brightness4 as Brightness4Icon } from '@mui/icons-material'
import { Button, FormControl, FormControlLabel, Paper, Popover, Radio, RadioGroup } from '@mui/material'
import { analyticsEnum, logAnalytics } from '$lib/analytics'
import { useSettingsStore } from '$stores/settings'

/**
 * button that opens a popover with a radio group to change the color scheme
 */
export default function SettingsMenu() {
  /**
   * use the color scheme from the store
   */
  const { colorScheme, setColorScheme } = useSettingsStore()

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  /**
   * update the global color scheme when a radio button is clicked
   */
  function handleChange(_e: React.ChangeEvent<HTMLInputElement>, value: string) {
    setColorScheme(value)
    logAnalytics({
      category: analyticsEnum.nav.title,
      action: analyticsEnum.nav.actions.CHANGE_THEME,
      label: value,
    })
  }

  function handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    setAnchorEl(e.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  return (
    <>
      <Button onClick={handleClick} color="inherit" startIcon={<Brightness4Icon />}>
        Theme
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Paper sx={{ padding: 2, width: 150 }}>
          <FormControl>
            <RadioGroup aria-label="theme" name="theme" value={colorScheme} onChange={handleChange}>
              <FormControlLabel value="light" control={<Radio color="primary" />} label="Light" />
              <FormControlLabel value="dark" control={<Radio color="primary" />} label="Dark" />
              <FormControlLabel value="auto" control={<Radio color="primary" />} label="Automatic" />
            </RadioGroup>
          </FormControl>
        </Paper>
      </Popover>
    </>
  )
}
