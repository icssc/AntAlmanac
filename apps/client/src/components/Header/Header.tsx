import { AppBar, Box, Button, MenuList, MenuItem, Toolbar } from '@mui/material'

/**
 * main website header
 */
export default function Header() {
  return (
    <AppBar position="static" sx={{ '& .MuiButtonBase-root': { color: 'inherit' } }}>
      <Toolbar>
        <Button href="/">
          <Box component="img" src="/logo.png" height="64px"></Box>
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
