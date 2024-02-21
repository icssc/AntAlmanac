import { AppBar, Box, Menu, Toolbar, useMediaQuery } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import MenuIcon from '@material-ui/icons/Menu';
import { useState, type MouseEventHandler } from 'react';

import About from './About';
import Feedback from './Feedback';
import Import from './Import';
import LoadSaveScheduleFunctionality from './LoadSaveFunctionality';
import SettingsMenu from './SettingsMenu';
import Export from './Export';
import Logo from '$assets/christmas-logo.png';
import MobileLogo from '$assets/christmas-mobile-logo.png';

const styles = {
    appBar: {
        marginBottom: '4px',
        boxShadow: 'none',
        minHeight: 0,
        height: '50px',
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
    menuIconContainer: {
        padding: '0.25rem',
        display: 'flex',
    },
};

interface CustomAppBarProps {
    classes: ClassNameMap;
}

const components = [
    <Import key="studylist" />,
    <Export key="export" />,
    <Feedback key="feedback" />,
    <About key="about" />,
    <SettingsMenu key="settings" />,
];

const Header = ({ classes }: CustomAppBarProps) => {
    const isMobileScreen = useMediaQuery('(max-width:750px)');

    const [anchorEl, setAnchorEl] = useState<Element | null>(null);

    const handleClick: MouseEventHandler<SVGSVGElement> = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar position="static" className={classes.appBar}>
            <Toolbar variant="dense">
                <img
                    height={32}
                    src={isMobileScreen ? MobileLogo : Logo}
                    title={'Thanks Aejin for designing this seasonal logo!'}
                    alt="logo"
                />

                <div style={{ flexGrow: '1' }} />

                <LoadSaveScheduleFunctionality />

                {isMobileScreen ? (
                    <Box className={classes.menuIconContainer}>
                        <MenuIcon onClick={handleClick} className={classes.menuIcon} />
                        <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                            {components.map((element, index) => (
                                <MenuItem key={index}>{element}</MenuItem>
                            ))}
                        </Menu>
                    </Box>
                ) : (
                    components
                )}
            </Toolbar>
        </AppBar>
    );
};

export default withStyles(styles)(Header);
