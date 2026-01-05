import { TableRow, TableCell } from '@mui/material';
import { memo } from 'react';

import { NotificationTableDeleteCell } from '$components/RightPane/AddedCourses/Notifications/NotificationTableDeleteCell';
import { NotificationTableRowCheckbox } from '$components/RightPane/AddedCourses/Notifications/NotificationTableRowCheckbox';
import { CourseCodeCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/CourseCodeCell';
import { DetailsCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/DetailsCell';
import { NotifyOn, useNotificationStore } from '$stores/NotificationStore';

interface NotificationTableRowProps {
    notificationKey: string;
}

export const NotificationTableRow = memo(({ notificationKey }: NotificationTableRowProps) => {
    const notification = useNotificationStore.getState().notifications[notificationKey];
    if (!notification) {
        return null;
    }

    const { courseTitle, sectionType, term, sectionCode, lastCodes, lastUpdated, units, sectionNum } = notification;

    return (
        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <NotificationTableDeleteCell notificationKey={notificationKey} />
            <CourseCodeCell sectionCode={sectionCode} sx={{ width: 'unset', padding: '6px 16px' }} />
            <DetailsCell
                sectionType={sectionType}
                sectionNum={sectionNum}
                units={units}
                sx={{ width: 'unset', padding: '6px 16px' }}
            />
            <TableCell>{courseTitle}</TableCell>

            {Object.keys(notification.notifyOn).map((statusKey) => (
                <NotificationTableRowCheckbox
                    key={statusKey}
                    courseTitle={courseTitle}
                    sectionCode={sectionCode}
                    sectionType={sectionType}
                    units={units}
                    sectionNum={sectionNum}
                    lastUpdated={lastUpdated}
                    lastCodes={lastCodes}
                    term={term}
                    notificationKey={notificationKey}
                    statusKey={statusKey as keyof NotifyOn}
                />
            ))}
        </TableRow>
    );
});

NotificationTableRow.displayName = 'NotificationTableRow';
