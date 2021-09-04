import React from 'react';
import { AppBar, Button, Toolbar, Tooltip, Menu, useMediaQuery } from '@material-ui/core';
import LoadSaveScheduleFunctionality from './LoadSaveFunctionality';
import { Assignment } from '@material-ui/icons';
import MenuIcon from '@material-ui/icons/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import NotificationHub from './NotificationHub';
import SettingsMenu from './SettingsMenu';
import { ReactComponent as Logo } from './logo.svg';
import { ReactComponent as MobileLogo } from './mobile-logo.svg';
import News from './News';

const styles = {
    appBar: {
        marginBottom: '4px',
        boxShadow: 'none',
        minHeight: 0,
    },
    buttonMargin: {
        marginRight: '4px',
    },
};

const ConditionalWrapper = ({ condition, wrapper, children }) => {
    return condition ? wrapper(children) : children;
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
                        <Tooltip title="Give Us Feedback!">
                            <Button
                                onClick={() => {
                                    window.open('https://goo.gl/forms/eIHy4kp56pZKP9fK2', '_blank');
                                }}
                                color="inherit"
                                startIcon={<Assignment />}
                            >
                                Feedback
                            </Button>
                        </Tooltip>,
                        <News />,
                    ].map((element) => (
                        <ConditionalWrapper
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
