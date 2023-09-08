import { AppBar, Box, Menu, Toolbar, useMediaQuery } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import MenuIcon from '@material-ui/icons/Menu';
import { useState, type MouseEventHandler } from 'react';

import AboutPage from './AboutPage';
import Feedback from './Feedback';
import ImportStudyList from './ImportStudyList';
import LoadSaveScheduleFunctionality from './LoadSaveFunctionality';
import News from './News';
import SettingsMenu from './SettingsMenu';
import Export from './Exports/Export';
import { ReactComponent as Logo } from './logo.svg';
import { ReactComponent as MobileLogo } from './mobile-logo.svg';

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
    <SettingsMenu key="settings" />,
    <ImportStudyList key="studylist" />,
    <Export key="export" />,
    <Feedback key="feedback" />,
    <News key="news" />,
    <AboutPage key="about" />,
];

const CustomAppBar = ({ classes }: CustomAppBarProps) => {
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
                {isMobileScreen ? <MobileLogo height={32} /> : <Logo height={32} />}

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

export default withStyles(styles)(CustomAppBar);
