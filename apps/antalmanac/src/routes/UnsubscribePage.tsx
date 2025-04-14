import { Box } from '@mui/material';
import { Notification } from '@packages/antalmanac-types';
import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import trpc from '$lib/api/trpc';


export const Unsubscribe = () => {
    const { userId } = useParams();
    const [searchParams] = useSearchParams();

    const sectionCode = searchParams.get('sectionCode');
    const quarter = searchParams.get('quarter');
    const year = searchParams.get('year');
    const unsubscribeAll = searchParams.get('unsubscribeAll');

    useEffect(() => {
        if (!userId || !sectionCode || !quarter || !year) return;

        const term = `${year} ${quarter}`;

        const notification: Notification = {
            term,
            sectionCode: Number(sectionCode),
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

        const runUnsubscribe = async () => {
            try {
                await trpc.notifications.deleteNotification.mutate({ id: userId, notification });
            } catch (err) {
                console.error('Error unsubscribing:', err);
            }
        };
        runUnsubscribe();
    }, [userId, sectionCode, quarter, year]);

    return (
        <Box sx={{ height: '100dvh', overflowY: 'auto' }}>
            <h1>Unsubscribe Page</h1>
            <p>User ID: {userId}</p>
            <p>Section Code: {sectionCode}</p>
            <p>Quarter: {quarter}</p>
            <p>Year: {year}</p>
            <p>Unsubscribe All: {unsubscribeAll}</p>
        </Box>
    );
};
