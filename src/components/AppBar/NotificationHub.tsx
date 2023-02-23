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
import { PureComponent } from 'react';

import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { LOOKUP_NOTIFICATIONS_ENDPOINT } from '$lib/api/endpoints';

interface NotificationItem {
    courseTitle: string;
    sectionCode: string;
}

interface NotificationAPIResponse {
    smsNotificationList: NotificationItem[];
}

interface NotificationHubState {
    open: boolean;
    phoneNumber: string;
    smsNotificationList: NotificationItem[];
}

class NotificationHub extends PureComponent {
    state: NotificationHubState = {
        open: false,
        phoneNumber: '',
        smsNotificationList: [],
    };

    getNotificationLists = async () => {
        let storedPhoneNumber;

        if (typeof Storage !== 'undefined') {
            // grep the project for `window\.localStorage\.setItem\('phoneNumber'` to find the source of this
            storedPhoneNumber = window.localStorage.getItem('phoneNumber');
        }
        if (storedPhoneNumber) {
            const response = await fetch(LOOKUP_NOTIFICATIONS_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: storedPhoneNumber.replace(/ /g, '') }),
            });

            const jsonResp = (await response.json()) as NotificationAPIResponse;

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
                            void this.getNotificationLists();
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
                    <DialogTitle>Notifications You&apos;ve Registered For</DialogTitle>

                    <DialogContent dividers={true}>
                        <DialogContentText>
                            {this.state.phoneNumber ? (
                                <div>
                                    Watchlist for {this.state.phoneNumber}:
                                    <ul>
                                        {this.state.smsNotificationList.map((section, index) => {
                                            return (
                                                <li key={index}>
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
