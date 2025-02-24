import { TableRow, TableCell } from '@mui/material';
import { memo } from 'react';

import { NotificationTableRowCheckbox } from '$components/RightPane/AddedCourses/NotificationTableRowCheckbox';
import { NotificationStatus, useNotificationStore } from '$stores/NotificationStore';

interface NotificationTableRowProps {
    notificationKey: string;
}

export const NotificationTableRow = memo(({ notificationKey }: NotificationTableRowProps) => {
    const notification = useNotificationStore.getState().notifications[notificationKey];
    if (!notification) {
        return null;
    }

    const { courseTitle, term, sectionCode } = notification;

    return (
        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell>{term}</TableCell>
            <TableCell>{sectionCode}</TableCell>
            <TableCell>{courseTitle}</TableCell>

            {Object.keys(notification.notificationStatus).map((statusKey) => (
                <NotificationTableRowCheckbox
                    key={statusKey}
                    courseTitle={courseTitle}
                    sectionCode={sectionCode}
                    term={term}
                    notificationKey={notificationKey}
                    statusKey={statusKey as keyof NotificationStatus}
                />
            ))}
        </TableRow>
    );
});

NotificationTableRow.displayName = 'NotificationTableRow';
