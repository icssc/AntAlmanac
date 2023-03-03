import { AppBar, Box, Drawer, List, ListItem, Toolbar } from '@mui/material'
import News from './News'
import About from './About'

/**
 * main website header
 */
export default function Header() {
  return (
    <AppBar position="static" sx={{ '& .MuiListItemIcon-root': { color: 'inherit' } }}>
      <Toolbar>
        <Box sx={{ flex: 1 }} />
        <List sx={{ display: 'flex' }}>
          <ListItem dense>
            <News />
          </ListItem>
          <ListItem dense>
            <About />
          </ListItem>
        </List>
        <Drawer>
          <List sx={{ width: 200 }}>
            <ListItem disablePadding>
              <News />
            </ListItem>
            <ListItem disablePadding>
              <About />
            </ListItem>
          </List>
        </Drawer>
      </Toolbar>
    </AppBar>
  )
}
