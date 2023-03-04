import { useState } from 'react'
import { AppBar, Box, Button, Drawer, IconButton, List, Toolbar } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'
import About from './About'
import Feedback from './Feedback'
import Old from './Old'
import Logo from './Logo'
import Notifications from './Notifications'
import Settings from './Settings'
import News from './News'
import Account from './Account'

/**
 * main website header
 */
export default function Header() {
  const [open, setOpen] = useState(false)

  const openDrawer = () => {
    setOpen(true)
  }

  const closeDrawer = () => {
    setOpen(false)
  }

  return (
    <AppBar enableColorOnDark position="static" sx={{ '& .MuiButtonBase-root': { color: 'inherit' } }}>
      <Toolbar>
        <IconButton onClick={openDrawer}>
          <MenuIcon fontSize="large" />
        </IconButton>

        <Box sx={{ flex: 1 }}>
          <Button href="/">
            <Logo />
          </Button>
        </Box>

        <Drawer open={open} onClose={closeDrawer}>
          <List sx={{ width: 200 }}>
            <About />
            <Feedback />
            <Old />
          </List>
        </Drawer>

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Notifications />
          <News />
          <Settings />
          <Account />
        </Box>
      </Toolbar>
    </AppBar>
  )
}
