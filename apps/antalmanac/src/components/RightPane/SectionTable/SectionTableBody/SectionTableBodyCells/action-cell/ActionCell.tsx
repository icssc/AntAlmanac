import ColorPicker from '$components/ColorPicker';
import { AddButton } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/AddButton';
import { DeleteButton } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/DeleteButton';
import { NotificationsMenu } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/NotificationsMenu';
import { SectionActionMenu } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/SectionActionMenu';
import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { useIsMobile } from '$hooks/useIsMobile';
import analyticsEnum from '$lib/analytics/analytics';
import type { Term } from '$lib/termData';
import AppStore from '$stores/AppStore';
import { useNotificationStore } from '$stores/NotificationStore';
import { Box, CircularProgress, IconButton } from '@mui/material';
import type { AASection, CourseDetails } from '@packages/antalmanac-types';
import { memo, useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

interface ActionCellProps {
    section: AASection;
    term: Term['shortName'];
    courseDetails: CourseDetails;
    scheduleConflict: boolean;
    addedCourse: boolean;
    scheduleNames: string[];
}

function getSectionColor(sectionCode: string, term: string): string {
    return AppStore.schedule.getExistingCourseInSchedule(sectionCode, term)?.section.color ?? '#5ec8e0';
}

export const ActionCell = memo(
    ({ section, term, courseDetails, scheduleConflict, addedCourse, scheduleNames }: ActionCellProps) => {
        const initialized = useNotificationStore(useShallow((state) => state.initialized));
        const isMobile = useIsMobile();

        const [sectionColor, setSectionColor] = useState(() => getSectionColor(section.sectionCode, term));

        const updateColor = useCallback(() => {
            setSectionColor(getSectionColor(section.sectionCode, term));
        }, [section.sectionCode, term]);

        useEffect(() => {
            AppStore.on('addedCoursesChange', updateColor);
            AppStore.on('colorChange', updateColor);
            AppStore.on('currentScheduleIndexChange', updateColor);

            return () => {
                AppStore.removeListener('addedCoursesChange', updateColor);
                AppStore.removeListener('colorChange', updateColor);
                AppStore.removeListener('currentScheduleIndexChange', updateColor);
            };
        }, [updateColor]);

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

                    {!isMobile &&
                        (addedCourse ? (
                            <ColorPicker
                                color={sectionColor}
                                analyticsCategory={analyticsEnum.addedClasses}
                                isCustomEvent={false}
                                term={term}
                                sectionCode={section.sectionCode}
                            />
                        ) : (
                            <SectionActionMenu
                                section={section}
                                courseDetails={courseDetails}
                                term={term}
                                scheduleNames={scheduleNames}
                            />
                        ))}
                </Box>
            </TableBodyCellContainer>
        );
    }
);

ActionCell.displayName = 'ActionCell';
