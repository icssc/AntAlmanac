import { AASection, CourseDetails } from '@packages/antalmanac-types';
import { memo } from 'react';

import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { DeleteAndNotifications } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/DeleteAndNotifications';
import { ScheduleAddCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/ScheduleAddCell';
import { type NotifyOn } from '$stores/NotificationStore';

/**
 * Props received by components that perform actions on a specified section.
 */
export interface ActionCellProps {
    section: AASection;
    term: string;
    courseDetails: CourseDetails;
    scheduleConflict: boolean;
    addedCourse: boolean;
    notifyOn: NotifyOn | undefined;
    lastUpdated: string;
    lastCodes: string;
}

/**
 * Given a section and schedule information, provides appropriate set of actions.
 */
export const ActionCell = memo(({ ...props }: ActionCellProps) => {
    return (
        <TableBodyCellContainer sx={{ width: '8%' }}>
            {props.addedCourse ? (
                <DeleteAndNotifications {...props} courseTitle={props.courseDetails.courseTitle} />
            ) : (
                <ScheduleAddCell {...props} />
            )}
        </TableBodyCellContainer>
    );
});

ActionCell.displayName = 'ActionCell';
