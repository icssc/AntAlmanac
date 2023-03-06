import { AppBar, Menu, Toolbar, useMediaQuery } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import MenuIcon from '@material-ui/icons/Menu';
import React, { MouseEventHandler } from 'react';

import ConditionalWrapper from '../ConditionalWrapper';
import AboutPage from './AboutPage';
import Feedback from './Feedback';
import ImportStudyList from './ImportStudyList';
import LoadSaveScheduleFunctionality from './LoadSaveFunctionality';
import { ReactComponent as Logo } from './logo.svg';
import { ReactComponent as MobileLogo } from './mobile-logo.svg';
import News from './News';
import SettingsMenu from './SettingsMenu';

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
};

interface CustomAppBarProps {
    classes: ClassNameMap;
}

const CustomAppBar = ({ classes }: CustomAppBarProps) => {
    const isMobileScreen = useMediaQuery('(max-width:750px)');

    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

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

                <ConditionalWrapper
                    condition={isMobileScreen}
                    wrapper={(children) => (
                        <div>
                            <MenuIcon onClick={handleClick} />
                            <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                                {children}
                            </Menu>
                        </div>
                    )}
                >
                    <>
                        {[
                            // the keys here don't do anything they just make eslint happy.
                            <SettingsMenu key="settings" />,
                            <ImportStudyList key="studylist" />,
                            <Feedback key="feedback" />,
                            <News key="news" />,
                            <AboutPage key="about" />,
                        ].map((element, index) => (
                            <ConditionalWrapper
                                key={index}
                                condition={isMobileScreen}
                                wrapper={(children) => <MenuItem>{children}</MenuItem>}
                            >
                                {element}
                            </ConditionalWrapper>
                        ))}
                    </>
                </ConditionalWrapper>
            </Toolbar>
        </AppBar>
    );
};

export default withStyles(styles)(CustomAppBar);
