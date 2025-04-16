import { Box, Typography, Paper, Chip, Tooltip } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CustomEventsTable } from '$components/RightPane/AddedCoursePane/CustomEventsTable';
import { ScheduleNote } from '$components/RightPane/AddedCoursePane/ScheduleNote';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { clickToCopy } from '$lib/helpers';
import AppStore from '$stores/AppStore';
import { useFallbackStore } from '$stores/FallbackStore';

export function FallbackSchedule() {
    const { fallbackSchedules } = useFallbackStore();

    const [schedule, setSchedule] = useState(() => fallbackSchedules.at(AppStore.getCurrentScheduleIndex()));

    const handleSectionClick = useCallback((event: React.MouseEvent<HTMLDivElement>, section: string) => {
        clickToCopy(event, section);
        logAnalytics({
            category: analyticsEnum.classSearch.title,
            action: analyticsEnum.classSearch.actions.COPY_COURSE_CODE,
        });
    }, []);

    const sectionsByTerm: [string, string[]][] = useMemo(() => {
        const result = schedule?.courses.reduce((accumulated, course) => {
            accumulated[course.term] ??= [];
            accumulated[course.term].push(course.sectionCode);
            return accumulated;
        }, {} as Record<string, string[]>);

        return Object.entries(result ?? {});
    }, [schedule?.courses]);

    useEffect(() => {
        const updateFallbackSchedule = () => {
            setSchedule(fallbackSchedules.at(AppStore.getCurrentScheduleIndex()));
        };

        AppStore.on('currentScheduleIndexChange', updateFallbackSchedule);

        return () => {
            AppStore.off('currentScheduleIndexChange', updateFallbackSchedule);
        };
    }, [fallbackSchedules]);

    return (
        <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">Schedule: {schedule?.scheduleName}</Typography>
            {
                // Sections organized under terms, in case the schedule contains multiple terms
                sectionsByTerm.map(([term, sections]) => (
                    <Box key={term}>
                        <Typography variant="h6">Quarter: {term}</Typography>
                        <Paper key={term}>
                            {sections.map((section, index) => (
                                <Tooltip title="Click to copy course code" placement="right" key={index}>
                                    <Chip
                                        onClick={(event) => handleSectionClick(event, section)}
                                        label={section}
                                        size="small"
                                        sx={{ margin: 1.25 }}
                                        key={index}
                                    />
                                </Tooltip>
                            ))}
                        </Paper>
                    </Box>
                ))
            }

            <CustomEventsTable />

            <ScheduleNote />

            <Typography variant="body1">
                Anteater API is currently unreachable. This is the information that we can currently retrieve.
            </Typography>
        </Box>
    );
}
