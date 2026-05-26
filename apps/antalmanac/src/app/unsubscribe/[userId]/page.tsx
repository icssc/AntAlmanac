'use client';

import { trpcReact } from '$lib/api/trpc';
import { parseQuarter } from '$lib/termHelpers';
import { Box, Button } from '@mui/material';
import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function Page() {
    const { userId } = useParams<{ userId: string }>();
    const [searchParams] = useSearchParams();

    const sectionCode = searchParams.get('sectionCode');
    const searchParamQuarter = searchParams.get('quarter');
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
        const quarter = parseQuarter(searchParamQuarter);

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
}
