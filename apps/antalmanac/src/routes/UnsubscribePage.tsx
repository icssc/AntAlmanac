import { trpcReact } from '$lib/api/trpcReact';
import { parseQuarter } from '$lib/term';
import { Box, Button } from '@mui/material';
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

export const Unsubscribe = () => {
    const { userId } = useParams();
    const [searchParams] = useSearchParams();

    const sectionCode = searchParams.get('sectionCode');
    const _quarter = searchParams.get('quarter');
    const year = searchParams.get('year');
    const deptCode = searchParams.get('deptCode');
    const courseNumber = searchParams.get('courseNumber');
    const instructor = searchParams.get('instructor');
    const unsubscribeAll = searchParams.get('unsubscribeAll');

    const [done, setDone] = useState(false);

    const { mutate: deleteAllNotifications, isPending: isDeletingAll } =
        trpcReact.notifications.deleteAllNotifications.useMutation({
            onSuccess: () => setDone(true),
            onError: (err) => console.error('Error unsubscribing:', err),
        });

    const { mutate: deleteNotification, isPending: isDeletingOne } =
        trpcReact.notifications.deleteNotification.useMutation({
            onSuccess: () => setDone(true),
            onError: (err) => console.error('Error unsubscribing:', err),
        });

    const handleUnsubscribe = () => {
        const quarter = parseQuarter(_quarter);

        if (!userId || !sectionCode || !quarter || !year) {
            return;
        }

        if (unsubscribeAll === 'true') {
            deleteAllNotifications({ userId });
        } else {
            deleteNotification({ userId, sectionCode, year, quarter });
        }
    };

    const isPending = isDeletingAll || isDeletingOne;

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
                <Button
                    variant="contained"
                    color="error"
                    sx={{ mt: 2 }}
                    onClick={handleUnsubscribe}
                    disabled={isPending}
                    loading={isPending}
                >
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
