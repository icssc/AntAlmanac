import { useState } from 'react';
import { AppBar, Box, Toolbar, useMediaQuery } from '@mui/material';
import AboutButton from './AboutButton';

export default function CustomAppBar() {
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
        marginBottom: '4px',
        boxShadow: 'none',
        minHeight: 0,
        height: '50px',
        backgroundColor: '#305db7',
      }}
    >
      <Toolbar variant="dense">
        {/* {isMobileScreen ? <MobileLogo height={32} /> : <Logo height={32} />} */}
        <Box sx={{ flexGrow: '1' }} />
        {/* <LoadSaveScheduleFunctionality /> */}
        <AboutButton />
      </Toolbar>
    </AppBar>
  );
}
