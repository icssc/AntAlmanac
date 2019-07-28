import React, { Fragment, PureComponent } from 'react';
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
import { CloudDownload } from '@material-ui/icons';
import { loadSchedule } from '../../actions/AppStoreActions';

export default class LoadDialog extends PureComponent {
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
                //TODO: Error handling
                loadSchedule(this.state.userID);
            });
    };

    componentDidMount() {
        document.addEventListener(
            'keydown',
            this.handleEnterButtonPressed,
            false
        );
    }

    componentWillUnmount() {
        document.addEventListener(
            'keydown',
            this.handleEnterButtonPressed,
            false
        );
    }

    handleEnterButtonPressed = (event) => {
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
                    <CloudDownload />
                    {this.props.isDesktop ? (
                        <Typography color="inherit">LOAD</Typography>
                    ) : (
                        <Fragment />
                    )}
                </Button>
                <Dialog
                    open={this.state.open}
                    onClose={() => this.handleClose(true)}
                >
                    <DialogTitle>Load</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Enter your username here to load your schedules.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="User ID"
                            type="text"
                            fullWidth
                            placeholder="Enter here:"
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
                            Load
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}
