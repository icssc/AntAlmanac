import {
  AppBar,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Toolbar,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { Notifications as NotificationsIcon } from '@mui/icons-material'
import Logo from './Logo'
import Settings from './Settings'
import News from './News'

/**
 * main website header
 */
export default function Header() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <AppBar enableColorOnDark position="static" sx={{ '& .MuiButtonBase-root': { color: 'inherit' } }}>
      <Toolbar>
        <Box sx={{ flex: 1 }}>
          <Button href="/">
            <Logo />
          </Button>
        </Box>

        {!isMobile && (
          <List sx={{ display: 'flex' }}>
            <Tooltip title="Learn about us">
              <ListItem disablePadding>
                <ListItemButton>About</ListItemButton>
              </ListItem>
            </Tooltip>
            <Tooltip title="Give us feedback">
              <ListItem disablePadding>
                <ListItemButton href="https://forms.gle/k81f2aNdpdQYeKK8A" target="_blank">
                  Feedback
                </ListItemButton>
              </ListItem>
            </Tooltip>
            <Tooltip title="View our beta website">
              <ListItem disablePadding>
                <ListItemButton>Beta</ListItemButton>
              </ListItem>
            </Tooltip>
          </List>
        )}

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Tooltip title="Notifications">
            <IconButton>
              <NotificationsIcon />
            </IconButton>
          </Tooltip>
          <News />
          <Settings />
        </Box>
      </Toolbar>
    </AppBar>
  )
}
