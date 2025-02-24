import { TableCell, Checkbox } from '@mui/material';
import { AASection, Course } from '@packages/antalmanac-types';
import { memo, useCallback } from 'react';

import { NotificationStatus, useNotificationStore } from '$stores/NotificationStore';

interface NotificationTableRowCheckboxProps {
    courseTitle: Course['title'];
    sectionCode: AASection['sectionCode'];
    term: string;
    notificationKey: string;
    statusKey: keyof NotificationStatus;
}

export const NotificationTableRowCheckbox = memo(
    ({ courseTitle, sectionCode, term, notificationKey, statusKey }: NotificationTableRowCheckboxProps) => {
        const status = useNotificationStore(
            (state) => state.notifications[notificationKey]?.notificationStatus[statusKey] ?? false
        );
        const setNotifications = useNotificationStore((state) => state.setNotifications);

        const handleClick = useCallback(() => {
            setNotifications({ courseTitle, sectionCode, term, status: statusKey });
        }, [setNotifications, courseTitle, sectionCode, term, statusKey]);

        return (
            <TableCell align="center">
                <Checkbox checked={status} onClick={handleClick} />
            </TableCell>
        );
    }
);

NotificationTableRowCheckbox.displayName = 'NotificationTableRowCheckbox';
