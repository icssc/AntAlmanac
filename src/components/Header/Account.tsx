import { useEffect, useRef, useState } from 'react'
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material'
import { AccountCircle as AccountCircleIcon } from '@mui/icons-material'
// import googleOneTap from 'google-one-tap'

/**
 * button that opens menu with account controls
 */
export default function AccountButton() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // google.accounts.id.initialize({
    //   client_id: '381900514017-40ti38q9heo7aghcaaotdo1repun1lma.apps.googleusercontent.com',
    //   ux_mode: 'popup',
    //   callback(response) {
    //     console.log(response)
    //   },
    // })

    // google.accounts.id.renderButton(
    //   ref.current, { 
    //     theme: 'outline', 
    //     size: 'small',
    //     shape: 'circle',
    //   } // customization attributes
    // )

    // google.accounts.id.prompt() // also display the One Tap dialog
  }, [])

  function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  return (
    <>
      <Tooltip title="Account">
        <IconButton color="inherit" onClick={handleClick} ref={ref}>
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
