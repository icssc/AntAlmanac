import { AASection, CourseDetails } from '@packages/antalmanac-types';
import { memo } from 'react';

import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { DeleteAndNotifications } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/DeleteAndNotifications';
import { ScheduleAddCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/ScheduleAddCell';
import { type NotifyOn } from '$stores/NotificationStore';

/**
 * Props received by components that perform actions on a specified section.
 */
export interface ActionProps {
    /**
     * The section to perform actions on.
     */
    section: AASection;

    /**
     * The term that the section occurs in.
     */
    term: string;

    /**
     * Additional details about the course that the section occurs in.
     */
    courseDetails: CourseDetails;

    /**
     * The names of the schedules that the section can be added to.
     */
    scheduleNames: string[];

    /**
     * Whether the section has a schedule conflict with another event in the calendar.
     */
    scheduleConflict: boolean;

    /**
     * Whether the section has been added.
     */
    addedCourse: boolean;

    notifyOn: NotifyOn | undefined;
    lastUpdated: string;
    lastCodes: string;
}

/**
 * Given a section and schedule information, provides appropriate set of actions.
 */
export const ActionCell = memo(({ ...props }: ActionProps) => {
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
