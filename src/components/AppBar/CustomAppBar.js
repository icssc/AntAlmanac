import React, { Suspense } from 'react';
import { AppBar, Button, Toolbar, Tooltip, Menu, useMediaQuery } from '@material-ui/core';
import LoadSaveScheduleFunctionality from './LoadSaveFunctionality';
import { Assignment } from '@material-ui/icons';
import MenuIcon from '@material-ui/icons/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import NotificationHub from './NotificationHub';
import SettingsMenu from './SettingsMenu';
import News from './News';
import AboutPage from './AboutPage';
import ConditionalWrapper from '../ConditionalWrapper';
import ImportStudyList from './ImportStudyList';

const Logo = React.lazy(() => import('./Logo'));
const MobileLogo = React.lazy(() => import('./MobileLogo'));

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

const CustomAppBar = (props) => {
    const { classes } = props;

    const isMobileScreen = useMediaQuery('(max-width:750px)');

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar position="static" className={classes.appBar}>
            <Toolbar variant="dense">
                <Suspense fallback={<div style={classes.fallback}>Loading...</div>}>
                    {isMobileScreen ? <MobileLogo height={32} /> : <Logo height={32} />}
                </Suspense>

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
                    {[
                        <SettingsMenu />,
                        <NotificationHub />,
                        <ImportStudyList />,
                        <Tooltip title="Give Us Feedback!">
                            <Button
                                onClick={() => {
                                    window.open('https://forms.gle/k81f2aNdpdQYeKK8A', '_blank');
                                }}
                                color="inherit"
                                startIcon={<Assignment />}
                            >
                                Feedback
                            </Button>
                        </Tooltip>,
                        <News />,
                        <AboutPage />,
                    ].map((element, index) => (
                        <ConditionalWrapper
                            key={index}
                            condition={isMobileScreen}
                            wrapper={(children) => <MenuItem>{children}</MenuItem>}
                        >
                            {element}
                        </ConditionalWrapper>
                    ))}
                </ConditionalWrapper>
            </Toolbar>
        </AppBar>
    );
};

export default withStyles(styles)(CustomAppBar);
