import React, { PureComponent, Fragment } from 'react';
import {
    AppBar,
    Button,
    Toolbar,
    Tooltip,
    Typography,
} from '@material-ui/core';
import LoadSaveScheduleFunctionality from './LoadSaveFunctionality';
import { Assignment, Info } from '@material-ui/icons';
import { isMobile } from 'react-device-detect';
import { withStyles } from '@material-ui/core/styles';
import logo from './logo.png';
import NotificationHub from './NotificationHub';

const styles = {
    appBar: {
        marginBottom: '4px',
        boxShadow: 'none',
        backgroundColor: '#305db7',
    },
    buttonMargin: {
        marginRight: '4px',
    },
};

class CustomAppBar extends PureComponent {
    render() {
        const { classes } = this.props;

        return (
            <AppBar position="static" className={classes.appBar}>
                <Toolbar variant="dense">
                    <img height={32} src={logo} alt={'Logo'} />

                    <div style={{flexGrow: '1'}} />

                    <LoadSaveScheduleFunctionality />

                    <NotificationHub />

                    {!isMobile ? (
                        <Tooltip title="Give Us Feedback!">
                            <Button
                                onClick={() => {
                                    window.open(
                                        'https://goo.gl/forms/eIHy4kp56pZKP9fK2',
                                        '_blank'
                                    );
                                }}
                                color="inherit"
                            >
                                <Assignment className={classes.buttonMargin} />
                                {!isMobile ? 'Feedback' : ''}
                            </Button>
                        </Tooltip>
                    ) : (
                        <Fragment />
                    )}

                    <Tooltip title="Info Page">
                        <Button
                            onClick={() => {
                                window.open(
                                    'https://www.ics.uci.edu/~rang1/AntAlmanac/index.html',
                                    '_blank'
                                );
                            }}
                            color="inherit"
                        >
                            <Info className={classes.buttonMargin} />
                            {!isMobile ? 'About' : ''}
                        </Button>
                    </Tooltip>
                </Toolbar>
            </AppBar>
        );
    }
}

export default withStyles(styles)(CustomAppBar);
