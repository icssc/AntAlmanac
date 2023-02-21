import { useState } from 'react'
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material'
import { AccountCircle as AccountCircleIcon } from '@mui/icons-material'

/**
 * button that opens menu with account controls
 */
export default function AccountButton() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  return (
    <>
      <Tooltip title="Account">
        <IconButton color="inherit" onClick={handleClick}>
          <AccountCircleIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} keepMounted open={!!anchorEl} onClose={handleClose}>
        <MenuItem onClick={handleClose}>Account</MenuItem>
        <MenuItem onClick={handleClose}>Logout</MenuItem>
      </Menu>
    </>
  )
}
