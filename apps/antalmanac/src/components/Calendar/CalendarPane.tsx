'use client';

import { CalendarToolbar } from '$components/Calendar/Toolbar/CalendarToolbar';
import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';

const CalendarGrid = dynamic(
    () => import('$components/Calendar/CalendarRoot').then((m) => ({ default: m.CalendarGrid })),
    { ssr: false }
);

interface CalendarPaneProps {
    mountGrid?: boolean;
}

export function CalendarPane({ mountGrid = true }: CalendarPaneProps) {
    const [showFinalsSchedule, setShowFinalsSchedule] = useState(false);
    const toggleDisplayFinalsSchedule = useCallback(() => setShowFinalsSchedule((prev) => !prev), []);

    return (
        <>
            <CalendarToolbar
                showFinalsSchedule={showFinalsSchedule}
                toggleDisplayFinalsSchedule={toggleDisplayFinalsSchedule}
            />
            {mountGrid ? <CalendarGrid showFinalsSchedule={showFinalsSchedule} /> : null}
        </>
    );
}
