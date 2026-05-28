import { DeptCourseNumberCell } from '$components/RightPane/AddedCourses/Notifications/DeptCourseNumberCell';
import { NotificationTableDeleteCell } from '$components/RightPane/AddedCourses/Notifications/NotificationTableDeleteCell';
import { NotificationTableRowCheckbox } from '$components/RightPane/AddedCourses/Notifications/NotificationTableRowCheckbox';
import { CourseCodeCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/CourseCodeCell';
import { DetailsCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/DetailsCell';
import { InstructorsCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/InstructorsCell';
import { NotifyOn, useNotificationStore } from '$stores/NotificationStore';
import { TableCell, TableRow } from '@mui/material';
import { memo } from 'react';

interface NotificationTableRowProps {
    notificationKey: string;
}

export const NotificationTableRow = memo(({ notificationKey }: NotificationTableRowProps) => {
    const notification = useNotificationStore.getState().notifications[notificationKey];
    if (!notification) {
        return null;
    }

    const {
        courseTitle,
        sectionType,
        term,
        sectionCode,
        lastCodes,
        lastUpdatedStatus,
        units,
        sectionNum,
        deptCode,
        courseNumber,
        instructors,
    } = notification;

    return (
        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <NotificationTableDeleteCell notificationKey={notificationKey} />
            <CourseCodeCell
                sectionCode={sectionCode}
                analyticsCategory={analyticsEnum.classSearch}
                sx={{ width: 'unset', padding: '6px 16px' }}
            />
            <DeptCourseNumberCell
                deptCode={deptCode}
                courseNumber={courseNumber}
                courseTitle={courseTitle}
                sx={{ width: 'unset', padding: '6px 16px' }}
            />
            <DetailsCell
                section={{ sectionType, sectionNum, units: String(units) }}
                sx={{ width: 'unset', padding: '6px 16px' }}
            />
            {instructors && instructors.length > 0 ? (
                <InstructorsCell section={{ instructors }} sx={{ width: 'unset', padding: '6px 16px' }} />
            ) : (
                <TableCell sx={{ width: 'unset', padding: '6px 16px' }}>-</TableCell>
            )}

            {Object.keys(notification.notifyOn).map((statusKey) => (
                <NotificationTableRowCheckbox
                    key={statusKey}
                    courseTitle={courseTitle}
                    sectionCode={sectionCode}
                    sectionType={sectionType}
                    units={units}
                    sectionNum={sectionNum}
                    lastUpdatedStatus={lastUpdatedStatus}
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
