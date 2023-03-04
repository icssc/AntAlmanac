import { useEffect, useRef, useState } from 'react'
import { Box, IconButton, Menu, MenuItem, Tooltip } from '@mui/material'
import { AccountCircle as AccountCircleIcon } from '@mui/icons-material'
// import googleOneTap from 'google-one-tap'

/**
 * button that opens menu with account controls
 */
export default function Account() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const ref = useRef<HTMLButtonElement>(null)

  const loggedIn = false

  useEffect(() => {
    if (loggedIn) {
      return
    }

    window.google.accounts.id.initialize({
      client_id: '381900514017-40ti38q9heo7aghcaaotdo1repun1lma.apps.googleusercontent.com',
      ux_mode: 'popup',
      auto_select: true,
      callback(response) {
        console.log(response)
      },
      itp_support: true,
      context: 'use',
    })

    if (ref.current) {
      window.google.accounts.id.renderButton(ref.current, {
        type: 'icon',
        size: 'medium',
        shape: 'circle'
      })
    }
    window.google.accounts.id.prompt()
  }, [])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <Tooltip title="Account">
        {loggedIn ? (
          <IconButton color="inherit" onClick={handleClick} ref={ref}>
            <AccountCircleIcon />
          </IconButton>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box ref={ref}></Box>
          </Box>
        )}
      </Tooltip>
      <Menu anchorEl={anchorEl} keepMounted open={!!anchorEl} onClose={handleClose}>
        <MenuItem onClick={handleClose}>Account</MenuItem>
        <MenuItem onClick={handleClose}>Logout</MenuItem>
      </Menu>
    </>
  )
}
