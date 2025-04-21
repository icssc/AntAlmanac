import { Box, Button } from '@mui/material';
import { Notification } from '@packages/antalmanac-types';
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import trpc from '$lib/api/trpc';

export const Unsubscribe = () => {
    const { userId } = useParams();
    const [searchParams] = useSearchParams();

    const sectionCode = searchParams.get('sectionCode');
    const quarter = searchParams.get('quarter');
    const year = searchParams.get('year');
    const deptCode = searchParams.get('deptCode');
    const courseNumber = searchParams.get('courseNumber');
    const instructor = searchParams.get('instructor');
    const unsubscribeAll = searchParams.get('unsubscribeAll');

    const [done, setDone] = useState(false);

    const term = `${year} ${quarter}`;

    const handleUnsubscribe = async () => {
        if (!userId || !sectionCode || !quarter || !year) return;

        const notification: Notification = {
            term,
            sectionCode,
            courseTitle: '',
            sectionType: '',
            notificationStatus: {
                openStatus: false,
                waitlistStatus: false,
                fullStatus: false,
                restrictionStatus: false,
            },
            lastUpdated: '',
            lastCodes: '',
        };

        try {
            if (unsubscribeAll === 'true') {
                await trpc.notifications.deleteAllNotifications.mutate({ id: userId });
            } else {
                await trpc.notifications.deleteNotification.mutate({ id: userId, notification });
            }
            setDone(true);
        } catch (err) {
            console.error('Error unsubscribing:', err);
        }
    };

    return (
        <Box
            sx={{
                height: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                px: 2,
            }}
        >
            <h2>Hello, would you like to unsubscribe from notifications for</h2>
            <h2>{unsubscribeAll === 'true' ? 'ALL courses' : `${deptCode} ${courseNumber} (${instructor})`}</h2>
            {!done ? (
                <Button variant="contained" color="error" sx={{ mt: 2 }} onClick={handleUnsubscribe}>
                    Confirm Unsubscribe
                </Button>
            ) : (
                <>
                    <p>You have been unsubscribed.</p>
                    <a href="https://antalmanac.com/">Click here to return to AntAlmanac</a>
                </>
            )}
        </Box>
    );
};
