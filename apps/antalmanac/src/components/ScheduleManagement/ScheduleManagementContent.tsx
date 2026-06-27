'use client';

import dynamic from 'next/dynamic';

export const ScheduleManagementContent = dynamic(
    () =>
        import('./ScheduleManagementContent.impl').then((m) => ({
            default: m.ScheduleManagementContent,
        })),
    { ssr: false }
);
