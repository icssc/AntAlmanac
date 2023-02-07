import { useEffect, useState } from 'react';
import { AppBar, Box, Button, IconButton, Menu, MenuItem, Toolbar, Tooltip, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon, Assignment as AssignmentIcon } from '@mui/icons-material';
import AboutModal from './AboutModal';
import NewsModal from './NewsModal';
import Settings from './Settings';

import { ReactComponent as Logo } from './logo.svg';
import { ReactComponent as MobileLogo } from './logo.svg';

export default function CustomAppBar() {
  const isMobileScreen = useMediaQuery('(max-width:750px)');
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const [aboutOpen, setAboutOpen] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);

  function handleClick(event: React.MouseEvent<Element, MouseEvent>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function openAbout() {
    setAboutOpen(true);
  }

  function openNews() {
    setNewsOpen(true);
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
        marginBottom: '4px',
        boxShadow: 'none',
        minHeight: 0,
        height: '50px',
        backgroundColor: '#305db7',
      }}
    >
      <Toolbar variant="dense" sx={{ justifyContent: 'space-between' }}>
        {isMobileScreen ? <MobileLogo height={32} /> : <Logo height={32} />}

        {/* <LoadSaveScheduleFunctionality /> */}

        {isMobileScreen ? (
          <Box>
            <IconButton onClick={handleClick}>
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              <MenuItem onClick={openAbout}>
                <AboutModal />
              </MenuItem>
              <MenuItem onClick={openNews}>
                <NewsModal />
              </MenuItem>
              <MenuItem>
                <Tooltip title="Give Us Feedback">
            <Button
              href="https://forms.gle/k81f2aNdpdQYeKK8A"
              target="_blank"
              color="inherit"
              startIcon={<AssignmentIcon />}
            >
              Feedback
            </Button>
                </Tooltip>
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NewsModal />
            <AboutModal />
            <Button
              href="https://forms.gle/k81f2aNdpdQYeKK8A"
              target="_blank"
              color="inherit"
              startIcon={<AssignmentIcon />}
            >
              Feedback
            </Button>
            <Settings />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
