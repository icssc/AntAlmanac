import { useState } from 'react'
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  MenuList,
  Toolbar,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'
import Settings from './Settings'
import Notifications from './Notifications'
import Feedback from './Feedback'
import News from './News'
import About from './About'
import AccountButton from './Account'

/**
 * header buttons will either be MenuItems (desktop) or ListItemButtons (mobile)
 */
const HeaderButtons = [Settings, Notifications, Feedback, News, About]

export default function Header() {
  const [open, setOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  function handleOpen() {
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
  }

  return (
    <AppBar position="static" sx={{ bgcolor: '#305db7', '& .MuiListItemIcon-root': { color: 'inherit' } }}>
      <Toolbar disableGutters>
        <Button href="/">
          <Box component="img" src="/logo/desktop.svg" height={32} />
        </Button>

        <Box sx={{ flex: 1 }}></Box>

        {/* horizontal menu buttons for desktop */}
        {!isMobile && (
          <MenuList sx={{ display: 'flex' }}>
            {HeaderButtons.map((HeaderButton, index) => (
              <HeaderButton key={index} />
            ))}
          </MenuList>
        )}

        {/* menu icon to toggle the drawer for mobile */}
        {isMobile && (
          <IconButton onClick={handleOpen} color="inherit">
            <MenuIcon />
          </IconButton>
        )}

        {/* drawer with list item buttons for mobile */}
        {isMobile && (
          <Drawer open={open} onClose={handleClose}>
            <List>
              {HeaderButtons.map((HeaderButton, index) => (
                <HeaderButton list key={index} />
              ))}
            </List>
          </Drawer>
        )}
        <AccountButton />
      </Toolbar>
    </AppBar>
  )
}
