import React, { Fragment, PureComponent } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Tooltip,
} from '@material-ui/core';
import { Notifications } from '@material-ui/icons';

class NotificationHub extends PureComponent {
    state = {
        open: false,
        email: '',
        phoneNumber: '',
        emailNotificationList: [],
        smsNotificationList: [],
    };

    getNotificationLists = async () => {
        let storedEmail, storedPhoneNumber;

        if (typeof Storage !== 'undefined') {
            storedEmail = window.localStorage.getItem('email');
            storedPhoneNumber = window.localStorage.getItem('phoneNumber');
        }

        if (storedEmail || storedPhoneNumber) {
            const response = await fetch('/api/lookupNotifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({email: storedEmail, phoneNumber: storedPhoneNumber.replace(/ /g,'')}),
            });

            const jsonResp = await response.json();

            this.setState({
                email: storedEmail,
                phoneNumber: storedPhoneNumber,
                emailNotificationList: jsonResp.emailNotificationList,
                smsNotificationList: jsonResp.smsNotificationList
            });
        }
    };

    render() {
        return (
            <Fragment>
                <Tooltip title="Notifications Registered">
                    <Button
                        onClick={() => {
                            this.setState({ open: true });
                            this.getNotificationLists();
                        }}
                        color="inherit"
                        startIcon={<Notifications/>}
                    >
                        Notifications
                    </Button>
                </Tooltip>

                <Dialog
                    open={this.state.open}
                    onClose={() => {
                        this.setState({ open: false });
                    }}
                    scroll="paper"
                >
                    <DialogTitle>
                        Notifications You've Registered For
                    </DialogTitle>

                    <DialogContent dividers={true}>
                        <DialogContentText>
                            {this.state.email ? (
                                <div>
                                    Watchlist for {this.state.email}:
                                    <ul>
                                        {this.state.emailNotificationList.map((course, index) => {
                                            return (
                                                <li id={index}>
                                                    {course.name}: {course.code}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ) : (
                                "You have not signed up for any email notifications!"
                            )}

                            {this.state.phoneNumber ? (
                                <div>
                                    Watchlist for {this.state.phoneNumber}:
                                    <ul>
                                        {this.state.smsNotificationList.map((course, index) => {
                                            return (
                                                <li id={index}>
                                                    {course.name}: {course.code}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ) : (
                                "You have not signed up for any SMS notifications!"
                            )}
                        </DialogContentText>
                    </DialogContent>

                    <DialogActions>
                        <Button
                            onClick={() => {
                                this.setState({ open: false });
                            }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Fragment>
        );
    }
}

export default NotificationHub;
