import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Menu, Toolbar, useMediaQuery } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import React, { MouseEventHandler } from 'react';

import ConditionalWrapper from '../ConditionalWrapper';
import AboutPage from './AboutPage';
import Feedback from './Feedback';
import ImportStudyList from './ImportStudyList';
import LoadSaveScheduleFunctionality from './LoadSaveFunctionality';
import { ReactComponent as Logo } from './logo.svg';
import { ReactComponent as MobileLogo } from './mobile-logo.svg';
import News from './News';
import NotificationHub from './NotificationHub';
import SettingsMenu from './SettingsMenu';

const styles = {
    appBar: {
        paddingLeft: '12px',
        marginBottom: '4px',
        boxShadow: 'none',
        minHeight: 0,
        height: '50px',
        backgroundColor: '#305db7',
    },
    buttonMargin: {
        marginRight: '4px',
    },
    fallback: {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
};

const CustomAppBar = () => {
    const isMobileScreen = useMediaQuery('(max-width:750px)');

    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

    const handleClick: MouseEventHandler<SVGSVGElement> = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar position="static" sx={styles.appBar}>
            <Toolbar variant="dense">
                {isMobileScreen ? <MobileLogo height={32} /> : <Logo height={32} />}

                <Box sx={{ flexGrow: '1' }} />

                <LoadSaveScheduleFunctionality />

                <ConditionalWrapper
                    condition={isMobileScreen}
                    wrapper={(children) => (
                        <Box>
                            <MenuIcon onClick={handleClick} />
                            <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                                {children}
                            </Menu>
                        </Box>
                    )}
                >
                    <>
                        {[
                            SettingsMenu as React.FC,
                            NotificationHub,
                            ImportStudyList as React.FC,
                            Feedback,
                            News as React.FC,
                            AboutPage,
                        ].map((Element, index) => (
                            <ConditionalWrapper
                                key={index}
                                condition={isMobileScreen}
                                wrapper={(children) => <MenuItem>{children}</MenuItem>}
                            >
                                <Element />
                            </ConditionalWrapper>
                        ))}
                    </>
                </ConditionalWrapper>
            </Toolbar>
        </AppBar>
    );
};

export default CustomAppBar
