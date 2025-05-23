import { TableRow, TableCell } from '@mui/material';
import { memo } from 'react';

import { NotificationTableDeleteCell } from '$components/RightPane/AddedCourses/NotificationTableDeleteCell';
import { NotificationTableRowCheckbox } from '$components/RightPane/AddedCourses/NotificationTableRowCheckbox';
import { CourseCodeCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/CourseCodeCell';
import { DetailsCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/DetailsCell';
import { NotificationStatus, useNotificationStore } from '$stores/NotificationStore';

interface NotificationTableRowProps {
    notificationKey: string;
}

export const NotificationTableRow = memo(({ notificationKey }: NotificationTableRowProps) => {
    const notification = useNotificationStore.getState().notifications[notificationKey];
    if (!notification) {
        return null;
    }

    const { courseTitle, sectionType, term, sectionCode, lastCodes, lastUpdated } = notification;

    return (
        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <NotificationTableDeleteCell notificationKey={notificationKey} />
            <CourseCodeCell sectionCode={sectionCode} sx={{ width: 'unset', padding: '6px 16px' }} />
            <DetailsCell
                sectionType={sectionType}
                sectionNum={undefined}
                units={undefined}
                sx={{ width: 'unset', padding: '6px 16px' }}
            />
            <TableCell>{courseTitle}</TableCell>

            {Object.keys(notification.notificationStatus).map((statusKey) => (
                <NotificationTableRowCheckbox
                    key={statusKey}
                    courseTitle={courseTitle}
                    sectionCode={sectionCode}
                    sectionType={sectionType}
                    lastUpdated={lastUpdated}
                    lastCodes={lastCodes}
                    term={term}
                    notificationKey={notificationKey}
                    statusKey={statusKey as keyof NotificationStatus}
                />
            ))}
        </TableRow>
    );
});

NotificationTableRow.displayName = 'NotificationTableRow';
