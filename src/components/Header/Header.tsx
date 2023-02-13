import { useState } from 'react';
import { AppBar, Box, IconButton, Menu, MenuItem, Toolbar, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

import Settings from './Settings';
import Notifications from './Notifications';
import Feedback from './Feedback';
import News from './News';
import About from './About';

/**
 * all buttons to render for the header
 */
const Buttons = [Settings, Notifications, Feedback, News, About];

/**
 * main header at the top of the website
 */
export default function Header() {
  const isMobileScreen = useMediaQuery('(max-width:750px)');
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  function handleClick(event: React.MouseEvent<Element, MouseEvent>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <AppBar
      position="static"
      sx={{
        paddingLeft: '12px',
        boxShadow: 'none',
        minHeight: 0,
        height: '50px',
        backgroundColor: '#305db7',
      }}
    >
      <Toolbar variant="dense">
        {isMobileScreen ? (
          <>
            <img height={32} src="/logo/mobile.svg" />
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={handleClick} color="inherit">
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              {Buttons.map((AppBarButton, index) => (
                <MenuItem key={index}>
                  <AppBarButton />
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : (
          <>
            <img height={32} src="/logo/desktop.svg" />
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {Buttons.map((AppBarButton, index) => (
                <AppBarButton key={index} />
              ))}
            </Box>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
