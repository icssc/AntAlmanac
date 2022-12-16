import React from 'react';
import { AppBar, Button, Toolbar, Tooltip, Menu, useMediaQuery } from '@mui/material';
import LoadSaveScheduleFunctionality from './LoadSaveFunctionality';
import { Assignment } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { withStyles } from '@mui/styles';
import NotificationHub from './NotificationHub';
import SettingsMenu from './SettingsMenu';
import { ReactComponent as Logo } from './logo.svg';
import { ReactComponent as MobileLogo } from './mobile-logo.svg';
import News from './News';
import AboutPage from './AboutPage';
import ConditionalWrapper from '../ConditionalWrapper';
import ImportStudyList from './ImportStudyList';

const styles = (theme) => ({
    appBar: {
        paddingLeft: '12px',
        marginBottom: '4px',
        boxShadow: 'none',
        minHeight: 0,
        height: '50px',
        backgroundColor: theme.palette.appBar.main,
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
});

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
