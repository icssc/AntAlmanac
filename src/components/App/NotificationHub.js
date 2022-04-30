import React, { PureComponent } from 'react';
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
import ReactGA from 'react-ga';
import { LOOKUP_NOTIFICATIONS_ENDPOINT } from '../../api/endpoints';
import analyticsEnum, { logAnalytics } from '../../analytics';

class NotificationHub extends PureComponent {
    state = {
        open: false,
        phoneNumber: '',
        smsNotificationList: [],
    };

    getNotificationLists = async () => {
        let storedPhoneNumber;

        if (typeof Storage !== 'undefined') {
            storedPhoneNumber = window.localStorage.getItem('phoneNumber');
        }

        if (storedPhoneNumber) {
            const response = await fetch(LOOKUP_NOTIFICATIONS_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: storedPhoneNumber.replace(/ /g, '') }),
            });

            const jsonResp = await response.json();

            this.setState({
                phoneNumber: storedPhoneNumber,
                smsNotificationList: jsonResp.smsNotificationList,
            });
        }
    };

    render() {
        return (
            <>
                <Tooltip title="Notifications Registered">
                    <Button
                        onClick={() => {
                            this.setState({ open: true });
                            this.getNotificationLists();
                            ReactGA.event({
                                category: 'antalmanac-rewrite',
                                action: 'Click "Notifications"',
                            });
                            logAnalytics({
                                category: analyticsEnum.nav.title,
                                action: analyticsEnum.nav.actions.CLICK_NOTIFICATIONS,
                            });
                        }}
                        color="inherit"
                        startIcon={<Notifications />}
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
                    <DialogTitle>Notifications You've Registered For</DialogTitle>

                    <DialogContent dividers={true}>
                        <DialogContentText>
                            {this.state.phoneNumber ? (
                                <div>
                                    Watchlist for {this.state.phoneNumber}:
                                    <ul>
                                        {this.state.smsNotificationList.map((section, index) => {
                                            return (
                                                <li id={index}>
                                                    {section.courseTitle}: {section.sectionCode}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ) : (
                                'You have not registered for SMS notifications on this PC!'
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
            </>
        );
    }
}

export default NotificationHub;
