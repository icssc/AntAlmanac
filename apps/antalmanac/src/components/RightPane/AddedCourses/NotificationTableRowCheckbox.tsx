import { TableCell, Checkbox } from '@mui/material';
import { AASection } from '@packages/antalmanac-types';
import { memo, useCallback } from 'react';

import { NotificationStatus, useNotificationStore } from '$stores/NotificationStore';

interface NotificationTableRowCheckboxProps {
    sectionCode: AASection['sectionCode'];
    term: string;
    notificationKey: string;
    statusKey: keyof NotificationStatus;
}

export const NotificationTableRowCheckbox = memo(
    ({ sectionCode, term, notificationKey, statusKey }: NotificationTableRowCheckboxProps) => {
        const status = useNotificationStore(
            (state) => state.notifications[notificationKey]?.notificationStatus[statusKey] ?? false
        );
        const setNotifications = useNotificationStore((state) => state.setNotifications);

        const handleClick = useCallback(() => {
            setNotifications(sectionCode, term, statusKey);
        }, [sectionCode, term, statusKey, setNotifications]);

        return (
            <TableCell align="center">
                <Checkbox checked={status} onClick={handleClick} />
            </TableCell>
        );
    }
);

NotificationTableRowCheckbox.displayName = 'NotificationTableRowCheckbox';
