import React, { Fragment, PureComponent, useEffect } from 'react';
import { CloudDownload, Save } from '@material-ui/icons';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
} from '@material-ui/core';
import { loadSchedule, saveSchedule } from '../../actions/AppStoreActions';
import { withStyles } from '@material-ui/core/styles';
import { isMobile } from 'react-device-detect';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

const styles = {
    buttonMarginSave: {
        marginRight: '4px',
    },
    buttonMarginLoad: {
        marginRight: '8px',
    },
};

class LoadSaveButtonBase extends PureComponent {
    state = {
        isOpen: false,
        userID: '',
        rememberMe: true
    };

    handleOpen = () => {
        this.setState({isOpen: true});
        if (typeof Storage !== 'undefined') {
            const userID = window.localStorage.getItem('userID');
            if (userID !== null) {
                this.setState({ userID: userID });
            }
        }
    };

    handleClose = (wasCancelled) => {
        if (wasCancelled)
            this.setState({ isOpen: false }, () => {
                document.removeEventListener('keydown', this.enterEvent, false);
                this.setState({userID: ''});
            });
        else
            this.setState({ isOpen: false }, () => {
                document.removeEventListener('keydown', this.enterEvent, false);
                this.props.action(this.state.userID, this.state.rememberMe);
                this.setState({ userID: '' });
            });
    };

    handleToggleRememberMe = (event) => {
        this.setState({rememberMe: event.target.checked})
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!prevState.isOpen && this.state.isOpen)
            document.addEventListener('keydown', this.enterEvent, false);
        else if (prevState.isOpen && !this.state.isOpen)
            document.removeEventListener('keydown', this.enterEvent, false);
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
            <Fragment>
                <Button
                    onClick={this.handleOpen}
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
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={this.state.rememberMe}
                                    onChange={this.handleToggleRememberMe}
                                    color="primary"
                                />
                            }
                            label="Remember Me (Uncheck on shared computers)"
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
            </Fragment>
        );
    }
}

const LoadSaveScheduleFunctionality = (props) => {
    useEffect(() => {
        if (typeof Storage !== 'undefined') {
            const savedUserID = window.localStorage.getItem('userID');

            if (savedUserID != null) {
                loadSchedule(savedUserID);
            }
        }
    }, []);

    const { classes } = props;

    return (
        <Fragment>
            <LoadSaveButtonBase
                actionName={'Save'}
                action={saveSchedule}
                button={
                    <Fragment>
                        <Save className={classes.buttonMarginSave} />
                        {!isMobile ? 'Save' : ''}
                    </Fragment>
                }
            />
            <LoadSaveButtonBase
                actionName={'Load'}
                action={loadSchedule}
                button={
                    <Fragment>
                        <CloudDownload className={classes.buttonMarginLoad} />
                        {!isMobile ? 'Load' : ''}
                    </Fragment>
                }
            />
        </Fragment>
    );
};

export default withStyles(styles)(LoadSaveScheduleFunctionality);
