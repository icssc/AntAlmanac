import { Notification, NotifyOn, useNotificationStore } from '$stores/NotificationStore';
import { TableCell, Checkbox } from '@mui/material';
import { memo, useCallback } from 'react';

type NotificationTableRowCheckboxProps = Omit<Notification, 'notifyOn'> & {
    notificationKey: string;
    statusKey: keyof NotifyOn;
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
        lastUpdatedStatus,
        lastCodes,
    }: NotificationTableRowCheckboxProps) => {
        const status = useNotificationStore(
            (state) => state.notifications[notificationKey]?.notifyOn[statusKey] ?? false
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
                lastUpdatedStatus,
                lastCodes,
            });
        }, [
            setNotifications,
            courseTitle,
            sectionCode,
            sectionType,
            term,
            statusKey,
            lastUpdatedStatus,
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
