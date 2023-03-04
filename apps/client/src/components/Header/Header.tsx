import { useState } from 'react'
import { AppBar, Box, Button, Drawer, IconButton, List, Toolbar, useTheme, useMediaQuery } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'
import About from './About'
import Feedback from './Feedback'
import Beta from './Beta'
import Logo from './Logo'
import Notifications from './Notifications'
import Settings from './Settings'
import News from './News'
import Account from './Account'

/**
 * main website header
 */
export default function Header() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

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
        {isMobile && (
          <IconButton onClick={openDrawer}>
            <MenuIcon fontSize="large" />
          </IconButton>
        )}

        <Box sx={{ flex: 1 }}>
          <Button href="/">
            <Logo />
          </Button>
        </Box>

        {!isMobile && (
          <List sx={{ display: 'flex' }}>
            <About />
            <Feedback />
            <Beta />
          </List>
        )}

        <Drawer open={open} onClose={closeDrawer}>
          <List sx={{ width: 200 }}>
            <About />
            <Feedback />
            <Beta />
          </List>
        </Drawer>

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Notifications />
          <News />
          <Settings />
          <Account />
        </Box>
      </Toolbar>
    </AppBar>
  )
}
