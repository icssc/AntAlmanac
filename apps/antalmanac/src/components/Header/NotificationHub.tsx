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
import { usePostHog } from 'posthog-js/react';
import { memo, useState } from 'react';

import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { LOOKUP_NOTIFICATIONS_ENDPOINT } from '$lib/api/endpoints';
import { getLocalStoragePhoneNumber } from '$lib/localStorage';

interface NotificationItem {
    courseTitle: string;
    sectionCode: string;
}

interface NotificationAPIResponse {
    smsNotificationList: NotificationItem[];
}

const NotificationHub = memo(function NotificationHub() {
    const [open, setOpen] = useState<boolean>(false);
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [smsNotificationList, setSmsNotificationList] = useState<NotificationItem[]>([]);

    const postHog = usePostHog();

    const getNotificationLists = async () => {
        let storedPhoneNumber;

        if (typeof Storage !== 'undefined') {
            // grep the project for `window\.localStorage\.setItem\('phoneNumber'` to find the source of this
            storedPhoneNumber = getLocalStoragePhoneNumber();
        }
        if (storedPhoneNumber) {
            const response = await fetch(LOOKUP_NOTIFICATIONS_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: storedPhoneNumber.replace(/ /g, '') }),
            });

            const jsonResp = (await response.json()) as NotificationAPIResponse;

            setPhoneNumber(storedPhoneNumber);
            setSmsNotificationList(jsonResp.smsNotificationList);
        }
    };

    return (
        <>
            <Tooltip title="Notifications Registered">
                <Button
                    onClick={() => {
                        setOpen(true);
                        void getNotificationLists();
                        logAnalytics(postHog, {
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
                open={open}
                onClose={() => {
                    setOpen(false);
                }}
                scroll="paper"
            >
                <DialogTitle>Notifications You&apos;ve Registered For</DialogTitle>

                <DialogContent dividers={true}>
                    <DialogContentText>
                        {phoneNumber ? (
                            <div>
                                Watchlist for {phoneNumber}:
                                <ul>
                                    {smsNotificationList.map((section, index) => {
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
                            setOpen(false);
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
});

export default NotificationHub;
