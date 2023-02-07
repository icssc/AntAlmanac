import { useEffect, useState } from 'react';
import { AppBar, Box, IconButton, Menu, MenuItem, Toolbar, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

import AboutModal from './AboutModal';
import NewsModal from './NewsModal';
import Settings from './Settings';
import NotificationHub from './NotificationsHub';
import FeedbackButton from './FeedbackButton';

import { ReactComponent as Logo } from './logo.svg';
import { ReactComponent as MobileLogo } from './logo.svg';

const AppBarButtons = [
      Settings,
      NotificationHub,
      FeedbackButton,
      NewsModal,
      AboutModal,
]

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
      <Toolbar variant="dense" sx={{ justifyContent: 'space-between' }}>
        {isMobileScreen ? <MobileLogo height={32} /> : <Logo height={32} />}
        {isMobileScreen ? (
          <Box>
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
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {AppBarButtons.map((AppBarButton, index) => (
                <AppBarButton key={index} />
              ))}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
