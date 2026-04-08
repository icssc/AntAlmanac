import { Box, CircularProgress, IconButton } from '@mui/material';
import { AASection, CourseDetails } from '@packages/antalmanac-types';
import { memo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import ColorPicker from '$components/ColorPicker';
import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { AddButton } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/AddButton';
import { DeleteButton } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/DeleteButton';
import { NotificationsMenu } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/NotificationsMenu';
import analyticsEnum from '$lib/analytics/analytics';
import { Term } from '$lib/termData';
import { useNotificationStore } from '$stores/NotificationStore';

interface ActionCellProps {
    section: AASection;
    term: Term['shortName'];
    courseDetails: CourseDetails;
    scheduleConflict: boolean;
    addedCourse: boolean;
}

export const ActionCell = memo(({ section, term, courseDetails, scheduleConflict, addedCourse }: ActionCellProps) => {
    const initialized = useNotificationStore(useShallow((state) => state.initialized));

    return (
        <TableBodyCellContainer sx={{ paddingX: 1 }}>
            <Box
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                }}
            >
                {addedCourse ? (
                    <DeleteButton sectionCode={section.sectionCode} term={term} />
                ) : (
                    <AddButton
                        section={section}
                        courseDetails={courseDetails}
                        term={term}
                        scheduleConflict={scheduleConflict}
                    />
                )}

                <ColorPicker
                    color="#5ec8e0"
                    analyticsCategory={analyticsEnum.addedClasses}
                    isCustomEvent={false}
                    term={term}
                    sectionCode={section.sectionCode}
                />

                {initialized ? (
                    <NotificationsMenu
                        section={section}
                        term={term}
                        courseTitle={courseDetails.courseTitle}
                        deptCode={courseDetails.deptCode}
                        courseNumber={courseDetails.courseNumber}
                    />
                ) : (
                    <IconButton disabled size="small" sx={{ p: 1 }}>
                        <CircularProgress size={15} />
                    </IconButton>
                )}
            </Box>
        </TableBodyCellContainer>
    );
});

ActionCell.displayName = 'ActionCell';
