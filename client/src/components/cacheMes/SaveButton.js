import React, { Component, Fragment } from 'react';
import {
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Typography,
} from '@material-ui/core';
import { Save } from '@material-ui/icons';
import { saveSchedule } from '../../actions/AppStoreActions';

export default class FormDialog extends Component {
    state = {
        open: false,
        userID: null,
    };

    handleOpen = () => {
        this.setState({ open: true });
    };

    handleClose = (wasCancelled) => {
        if (wasCancelled) this.setState({ open: false });
        else
            this.setState({ open: false }, () => {
                saveSchedule(this.state.userID);
            });
    };

    componentDidMount() {
        if (typeof Storage !== 'undefined') {
            const userID = window.localStorage.getItem('userID');
            if (userID !== null) {
                this.setState({ userID: userID });
            }
        }

        document.addEventListener('keydown', this.enterEvent, false);
    }

    componentWillUnmount() {
        document.addEventListener('keydown', this.enterEvent, false);
    }

    enterEvent = (event) => {
        const charCode = event.which ? event.which : event.keyCode;

        if (charCode === 13 || charCode === 10) {
            event.preventDefault();
            this.handleClose(false);

            return false;
        }
    };

    setUserID = (event) => {
        this.setState({ userID: event.target.value });
    };

    render() {
        return (
            <div>
                <Button onClick={this.handleOpen} color="inherit">
                    <Save />
                    {this.props.isDesktop ? (
                        <Typography color="inherit">
                            &nbsp;&nbsp;Save
                        </Typography>
                    ) : (
                        <Fragment />
                    )}
                </Button>
                <Dialog
                    open={this.state.open}
                    onClose={() => this.handleClose(true)}
                >
                    <DialogTitle id="form-dialog-title">Save</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Enter your useruserID here to save your schedules.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="User ID"
                            type="text"
                            fullWidth
                            placeholder="Enter here"
                            defaultValue={this.state.userID}
                            onChange={this.setUserID}
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
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}
