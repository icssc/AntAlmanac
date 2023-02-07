import { useEffect, useState } from 'react';
import { AppBar, Box, IconButton, Menu, MenuItem, Toolbar, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

import { ReactComponent as Logo } from './logo.svg';
import { ReactComponent as MobileLogo } from './logo.svg';

import Settings from './Settings';
import NotificationHub from './NotificationsHub';
import FeedbackButton from './FeedbackButton';
import NewsModal from './NewsModal';
import AboutModal from './AboutModal';

/**
 * all buttons to render for the app bar
 */
const AppBarButtons = [Settings, NotificationHub, FeedbackButton, NewsModal, AboutModal];

/**
 * main app bar, i.e. header
 */
export default function CustomAppBar() {
  const isMobileScreen = useMediaQuery('(max-width:750px)');
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  function handleClick(event: React.MouseEvent<Element, MouseEvent>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  /**
   * close the menu whenever mobile screen is resized to desktop
   */
  useEffect(() => {
    if (!isMobileScreen) {
      handleClose();
    }
  }, [isMobileScreen]);

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
            <MobileLogo height={32} />
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={handleClick} color="inherit">
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              {AppBarButtons.map((AppBarButton, index) => (
                <MenuItem key={index}>
                  <AppBarButton />
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : (
          <>
            <Logo height={32} />
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {AppBarButtons.map((AppBarButton, index) => (
                <AppBarButton key={index} />
              ))}
            </Box>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
