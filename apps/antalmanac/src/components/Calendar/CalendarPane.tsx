'use client';

import { CalendarToolbar } from '$components/Calendar/Toolbar/CalendarToolbar';
import { useMediaQuery, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';

const CalendarGrid = dynamic(
    () => import('$components/Calendar/CalendarRoot').then((m) => ({ default: m.CalendarGrid })),
    { ssr: false }
);

export function CalendarPane() {
    const theme = useTheme();
    const showCalendarPane = useMediaQuery(theme.breakpoints.up('sm'));

    const [showFinalsSchedule, setShowFinalsSchedule] = useState(false);
    const toggleDisplayFinalsSchedule = useCallback(() => setShowFinalsSchedule((prev) => !prev), []);

    return (
        <>
            <CalendarToolbar
                showFinalsSchedule={showFinalsSchedule}
                toggleDisplayFinalsSchedule={toggleDisplayFinalsSchedule}
            />
            {showCalendarPane ? <CalendarGrid showFinalsSchedule={showFinalsSchedule} /> : null}
        </>
    );
}
