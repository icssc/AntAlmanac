import { AddButton } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/AddButton';
import { DeleteButton } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/DeleteButton';
import { NotificationsMenu } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/NotificationsMenu';
import { SectionActionMenu } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/SectionActionMenu';
import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { useIsMobile } from '$hooks/useIsMobile';
import { Term } from '$lib/termData';
import AppStore from '$stores/AppStore';
import { useHiddenCoursesStore } from '$stores/HiddenCoursesStore';
import { useNotificationStore } from '$stores/NotificationStore';
import { Visibility, VisibilityOff, VisibilityOutlined } from '@mui/icons-material';
import { Box, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { AASection, CourseDetails } from '@packages/antalmanac-types';
import { memo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

interface ActionCellProps {
    section: AASection;
    term: Term['shortName'];
    courseDetails: CourseDetails;
    scheduleConflict: boolean;
    addedCourse: boolean;
    scheduleNames: string[];
}

export const ActionCell = memo(
    ({ section, term, courseDetails, scheduleConflict, addedCourse, scheduleNames }: ActionCellProps) => {
        const initialized = useNotificationStore(useShallow((state) => state.initialized));
        const cycleVisibility = useHiddenCoursesStore((state) => state.cycleVisibility);
        const classVisibility = useHiddenCoursesStore((state) =>
            state.getVisibility(AppStore.getCurrentScheduleId(), section.sectionCode)
        );
        const isMobile = useIsMobile();
        const handleVisibilityToggle = useCallback(() => {
            cycleVisibility(AppStore.getCurrentScheduleId(), section.sectionCode);
        }, [section.sectionCode, cycleVisibility]);

        return (
            <TableBodyCellContainer sx={{ paddingX: 0.5 }}>
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

                    {addedCourse && (
                        <Tooltip
                            title={
                                classVisibility === 'visible'
                                    ? 'Outline class in calendar'
                                    : classVisibility === 'outlined'
                                      ? 'Hide class in calendar'
                                      : 'Show class in calendar'
                            }
                            arrow
                            disableInteractive
                        >
                            <IconButton onClick={handleVisibilityToggle} size="small" sx={{ p: 0.5 }}>
                                {classVisibility === 'visible' ? (
                                    <Visibility fontSize="small" />
                                ) : classVisibility === 'outlined' ? (
                                    <VisibilityOutlined fontSize="small" />
                                ) : (
                                    <VisibilityOff fontSize="small" />
                                )}
                            </IconButton>
                        </Tooltip>
                    )}

                    {initialized ? (
                        <NotificationsMenu
                            section={section}
                            term={term}
                            courseTitle={courseDetails.courseTitle}
                            deptCode={courseDetails.deptCode}
                            courseNumber={courseDetails.courseNumber}
                        />
                    ) : (
                        <IconButton disabled size="small" sx={{ p: 0.5 }}>
                            <CircularProgress size={15} />
                        </IconButton>
                    )}

                    {!isMobile && !addedCourse && (
                        <SectionActionMenu
                            section={section}
                            courseDetails={courseDetails}
                            term={term}
                            scheduleNames={scheduleNames}
                        />
                    )}
                </Box>
            </TableBodyCellContainer>
        );
    }
);

ActionCell.displayName = 'ActionCell';
