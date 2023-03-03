import { AppBar, Button, MenuList, MenuItem, Toolbar } from '@mui/material'
import Logo from './Logo'

/**
 * main website header
 */
export default function Header() {
  return (
    <AppBar position="static" sx={{ '& .MuiButtonBase-root': { color: 'inherit' } }}>
      <Toolbar>
        <Button href="/">
          <Logo />
        </Button>
        <MenuList sx={{ display: 'flex' }}>
          <MenuItem>About</MenuItem>
          <MenuItem>Feedback</MenuItem>
          <MenuItem>Beta</MenuItem>
        </MenuList>
      </Toolbar>
    </AppBar>
  )
}
