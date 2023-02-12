import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  Tooltip,
} from '@mui/material';
import { analyticsEnum, logAnalytics } from '$lib/analytics';
import { LOOKUP_NOTIFICATIONS_ENDPOINT } from '$lib/endpoints';

interface NotificationItem {
  courseTitle: string;
  sectionCode: string;
}

interface NotificationAPIResponse {
  smsNotificationList: NotificationItem[];
}

/**
 * notification bell that opens a modal with notifications
 */
export default function NotificationHub() {
  const [open, setOpen] = useState(false);

  const query = useQuery({
    queryKey: [LOOKUP_NOTIFICATIONS_ENDPOINT],
    async queryFn() {
      let storedPhoneNumber = typeof Storage !== 'undefined' ? localStorage.getItem('phoneNumber') : null;

      if (!storedPhoneNumber) {
        return {
          phoneNumber: '',
          smsNotificationList: [],
        };
      }

      const response = (await fetch(LOOKUP_NOTIFICATIONS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: storedPhoneNumber.replace(/ /g, '') }),
      }).then((res) => res.json())) as NotificationAPIResponse;

      return {
        phoneNumber: storedPhoneNumber,
        smsNotificationList: response.smsNotificationList,
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
              <Box>
                Watchlist for {query.data.phoneNumber}:
                <List>
                  {query.data.smsNotificationList.map((section, index) => (
                    <ListItem key={index}>
                      {section.courseTitle}: {section.sectionCode}
                    </ListItem>
                  ))}
                </List>
              </Box>
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
