import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip } from '@mui/material';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { LOOKUP_NOTIFICATIONS_ENDPOINT } from '$lib/endpoints';

interface NotificationItem {
  courseTitle: string;
  sectionCode: string;
}

interface NotificationAPIResponse {
  smsNotificationList: NotificationItem[];
}

export default function NotificationHub() {
  const [open, setOpen] = React.useState(false);

  const query = useQuery({
    queryKey: [LOOKUP_NOTIFICATIONS_ENDPOINT],
    async queryFn() {
      let storedPhoneNumber = '';

      if (typeof Storage !== 'undefined') {
        /**
         * grep the project for `window\.localStorage\.setItem\('phoneNumber'` to find the source of this
         */
        storedPhoneNumber = window.localStorage.getItem('phoneNumber');
      }

      if (storedPhoneNumber) {
        const response = (await fetch(LOOKUP_NOTIFICATIONS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: storedPhoneNumber.replace(/ /g, '') }),
        }).then((res) => res.json())) as NotificationAPIResponse;

        return {
          phoneNumber: storedPhoneNumber,
          smsNotificationList: response.smsNotificationList,
        };
      }

      return {
        phoneNumber: '',
        smsNotificationList: [],
      };
    },
  });

  function handleClick() {
    setOpen(true);
    query.refetch();
    logAnalytics({
      category: analyticsEnum.nav.title,
      action: analyticsEnum.nav.actions.CLICK_NOTIFICATIONS,
    });
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <Tooltip title="Notifications Registered">
        <Button onClick={handleClick} color="inherit" startIcon={<NotificationsIcon />}>
          Notifications
        </Button>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} scroll="paper">
        <DialogTitle>Notifications You&apos;ve Registered For</DialogTitle>

        <DialogContent dividers={true}>
          <DialogContentText>
            {query.data?.phoneNumber ? (
              <div>
                Watchlist for {query.data.phoneNumber}:
                <ul>
                  {query.data.smsNotificationList.map((section, index) => {
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
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
