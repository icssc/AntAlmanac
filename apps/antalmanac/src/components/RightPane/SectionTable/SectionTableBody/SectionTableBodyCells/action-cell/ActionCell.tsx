import { AddButton } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/AddButton';
import { DeleteButton } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/DeleteButton';
import { NotificationsMenu } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/NotificationsMenu';
import { SectionActionMenu } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/SectionActionMenu';
import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import AppStore from '$stores/AppStore';
import { useHiddenCoursesStore } from '$stores/HiddenCoursesStore';
import { useNotificationStore } from '$stores/NotificationStore';
import { Visibility, VisibilityOff, VisibilityOutlined } from '@mui/icons-material';
import { Box, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { VisibilityState, type AASection, type AACourseWithTerm } from '@packages/antalmanac-types';
import { memo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

interface ActionCellProps {
    section: AASection;
    course: AACourseWithTerm;
    scheduleConflict: boolean;
    addedCourse: boolean;
    scheduleNames: string[];
}

export const ActionCell = memo(({ section, course, scheduleConflict, addedCourse, scheduleNames }: ActionCellProps) => {
    const initialized = useNotificationStore((state) => state.initialized);
    const [cycleVisibility, classVisibility] = useHiddenCoursesStore(
        useShallow((state) => [
            state.cycleVisibility,
            state.getVisibility(AppStore.getCurrentScheduleId(), course.term, section.sectionCode),
        ])
    );

    const handleVisibilityToggle = useCallback(() => {
        cycleVisibility(AppStore.getCurrentScheduleId(), course.term, section.sectionCode);
    }, [section.sectionCode, course.term, cycleVisibility]);

    return (
        <TableBodyCellContainer sx={{ paddingX: 0.5 }}>
            <Box
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                }}
            >
                {addedCourse ? (
                    <DeleteButton section={section} course={course} />
                ) : (
                    <AddButton section={section} course={course} scheduleConflict={scheduleConflict} />
                )}

                {addedCourse && (
                    <Tooltip
                        title={
                            classVisibility === VisibilityState.Visible
                                ? 'Outline class in calendar'
                                : classVisibility === VisibilityState.Outlined
                                  ? 'Hide class in calendar'
                                  : 'Show class in calendar'
                        }
                        disableInteractive
                    >
                        <IconButton onClick={handleVisibilityToggle} size="small" sx={{ p: 0.5 }}>
                            {classVisibility === VisibilityState.Visible ? (
                                <Visibility fontSize="small" />
                            ) : classVisibility === VisibilityState.Outlined ? (
                                <VisibilityOutlined fontSize="small" />
                            ) : (
                                <VisibilityOff fontSize="small" />
                            )}
                        </IconButton>
                    </Tooltip>
                )}

                {initialized ? (
                    <NotificationsMenu section={section} course={course} />
                ) : (
                    <IconButton disabled size="small" sx={{ p: 0.5 }}>
                        <CircularProgress size={15} />
                    </IconButton>
                )}

                {!addedCourse && <SectionActionMenu section={section} course={course} scheduleNames={scheduleNames} />}
            </Box>
        </TableBodyCellContainer>
    );
});

ActionCell.displayName = 'ActionCell';
