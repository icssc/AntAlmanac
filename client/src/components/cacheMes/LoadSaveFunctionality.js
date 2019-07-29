import React, { Fragment, PureComponent, useEffect, useState } from 'react';
import {
    CheckCircle,
    Close,
    CloudDownload,
    Error,
    Save,
    Warning,
} from '@material-ui/icons';
import { amber, green } from '@material-ui/core/colors';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    SnackbarContent,
    TextField,
    Typography,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { loadSchedule, saveSchedule } from '../../actions/AppStoreActions';

const iconVariants = {
    success: CheckCircle,
    warning: Warning,
    error: Error,
};

const snackbarStyles = (theme) => ({
    success: {
        backgroundColor: green[600],
    },
    error: {
        backgroundColor: theme.palette.error.dark,
    },
    warning: {
        backgroundColor: amber[700],
    },
    icon: {
        fontSize: 20,
        opacity: 0.9,
        marginRight: theme.spacing.unit,
    },
    message: {
        display: 'flex',
        alignItems: 'center',
    },
});

const SnackBarMessageDisplay = withStyles(snackbarStyles)((props) => {
    const { classes, message, onClose, variant, ...other } = props;
    const Icon = iconVariants[variant];

    return (
        <SnackbarContent
            className={classes[variant]}
            message={
                <span className={classes.message}>
                    <Icon className={classes.icon} />
                    {message}
                </span>
            }
            action={[
                <IconButton
                    key="close"
                    color="inherit"
                    className={classes.close}
                    onClick={onClose}
                >
                    <Close className={classes.icon} />
                </IconButton>,
            ]}
            {...other}
        />
    );
});

class LoadSaveButtonBase extends PureComponent {
    state = {
        isOpen: false,
        userID: '',
    };

    handleClose = (wasCancelled) => {
        if (wasCancelled)
            this.setState({ isOpen: false }, () => {
                document.removeEventListener('keydown', this.enterEvent, false);
            });
        else
            this.setState({ isOpen: false }, () => {
                document.removeEventListener('keydown', this.enterEvent, false);
                this.props.action(this.state.userID);
            });
    };

    componentDidMount() {
        if (typeof Storage !== 'undefined') {
            const userID = window.localStorage.getItem('userID');
            if (userID !== null) {
                this.setState({ userID: userID });
            }
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.isOpen)
            document.addEventListener('keydown', this.enterEvent, false);
        else document.removeEventListener('keydown', this.enterEvent, false);
    }

    enterEvent = (event) => {
        const charCode = event.which ? event.which : event.keyCode;

        if (charCode === 13 || charCode === 10) {
            event.preventDefault();
            this.handleClose(false);

            return false;
        }
    };

    render() {
        return (
            <div>
                <Button
                    onClick={() => this.setState({ isOpen: true })}
                    color="inherit"
                >
                    {this.props.button}
                </Button>
                <Dialog open={this.state.isOpen}>
                    <DialogTitle>{this.props.actionName}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Enter your username here to{' '}
                            {this.props.actionName.toLowerCase()} your schedule.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="User ID"
                            type="text"
                            fullWidth
                            placeholder="Enter here"
                            value={this.state.userID}
                            onChange={(event) =>
                                this.setState({ userID: event.target.value })
                            }
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => this.handleClose(true)}
                            color="primary"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => this.handleClose(false)}
                            color="primary"
                        >
                            {this.props.actionName}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

const LoadSaveScheduleFunctionality = () => {
    useEffect(() => {
        if (typeof Storage !== 'undefined') {
            const savedUserID = window.localStorage.getItem('userID');

            if (savedUserID != null) {
                loadSchedule(savedUserID);
            }
        }
    }, []);

    return (
        <Fragment>
            <LoadSaveButtonBase
                actionName={'Save'}
                action={saveSchedule}
                button={
                    <Fragment>
                        <Save />
                        <Typography color="inherit">Save</Typography>
                    </Fragment>
                }
            />
            <LoadSaveButtonBase
                actionName={'Load'}
                action={loadSchedule}
                button={
                    <Fragment>
                        <CloudDownload />
                        <Typography color="inherit">Load</Typography>
                    </Fragment>
                }
            />
        </Fragment>
    );
};

//TODO: Render buttons differently on mobile/desktop

export default LoadSaveScheduleFunctionality;
