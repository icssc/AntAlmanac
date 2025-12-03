import { TableCell, Checkbox } from '@mui/material';
import { memo, useCallback } from 'react';

import { Notification, NotificationStatus, useNotificationStore } from '$stores/NotificationStore';

type NotificationTableRowCheckboxProps = Omit<Notification, 'notificationStatus'> & {
    notificationKey: string;
    statusKey: keyof NotificationStatus;
};

export const NotificationTableRowCheckbox = memo(
    ({
        courseTitle,
        sectionCode,
        term,
        units,
        sectionNum,
        sectionType,
        notificationKey,
        statusKey,
        lastUpdated,
        lastCodes,
    }: NotificationTableRowCheckboxProps) => {
        const status = useNotificationStore(
            (state) => state.notifications[notificationKey]?.notificationStatus[statusKey] ?? false
        );
        const setNotifications = useNotificationStore((state) => state.setNotifications);

        const handleClick = useCallback(() => {
            setNotifications({
                courseTitle,
                sectionCode,
                sectionType,
                term,
                units,
                sectionNum,
                status: statusKey,
                lastUpdated,
                lastCodes,
            });
        }, [
            setNotifications,
            courseTitle,
            sectionCode,
            sectionType,
            term,
            statusKey,
            lastUpdated,
            lastCodes,
            units,
            sectionNum,
        ]);

        return (
            <TableCell align="center">
                <Checkbox checked={status} onClick={handleClick} />
            </TableCell>
        );
    }
);

NotificationTableRowCheckbox.displayName = 'NotificationTableRowCheckbox';
