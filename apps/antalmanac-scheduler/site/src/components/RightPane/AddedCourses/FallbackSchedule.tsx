import { CustomEventsBox } from '$components/RightPane/AddedCourses/CustomEventsBox';
import { ScheduleNoteBox } from '$components/RightPane/AddedCourses/ScheduleNoteBox';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { clickToCopy } from '$lib/helpers';
import AppStore from '$stores/AppStore';
import { useFallbackStore } from '$stores/FallbackStore';
import { Box, Chip, Paper, Tooltip, Typography } from '@mui/material';
import { type ShortCourse } from '@packages/antalmanac-types';
import { usePostHog } from 'posthog-js/react';
import { useEffect, useMemo, useState } from 'react';

export function FallbackSchedule() {
    const getCurrentFallbackSchedule = useFallbackStore((store) => store.getCurrentFallbackSchedule);
    const [currentScheduleIndex, setCurrentScheduleIndex] = useState(() => AppStore.getCurrentScheduleIndex());
    const postHog = usePostHog();

    useEffect(() => {
        const handleScheduleIndexChange = () => {
            setCurrentScheduleIndex(AppStore.getCurrentScheduleIndex());
        };

        AppStore.on('currentScheduleIndexChange', handleScheduleIndexChange);

        return () => {
            AppStore.off('currentScheduleIndexChange', handleScheduleIndexChange);
        };
    }, []);

    const fallbackSchedule = getCurrentFallbackSchedule(currentScheduleIndex);

    const sectionsByTerm: [string, string[]][] = useMemo(() => {
        const result = fallbackSchedule.courses.reduce(
            (accumulated: Record<string, string[]>, course: ShortCourse) => {
                accumulated[course.term] ??= [];
                accumulated[course.term].push(course.sectionCode);
                return accumulated;
            },
            {} as Record<string, string[]>
        );

        return Object.entries(result);
    }, [fallbackSchedule.courses]);

    return (
        <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">{fallbackSchedule.scheduleName}</Typography>
            {
                // Sections organized under terms, in case the schedule contains multiple terms
                sectionsByTerm.map(([term, sections]) => (
                    <Box key={term}>
                        <Typography variant="h6">{term}</Typography>
                        <Paper key={term} elevation={1}>
                            {sections.map((section, index) => (
                                <Tooltip title="Click to copy section code" placement="right" key={index}>
                                    <Chip
                                        onClick={(event) => {
                                            clickToCopy(event, section);
                                            logAnalytics(postHog, {
                                                category: analyticsEnum.addedClasses,
                                                action: analyticsEnum.addedClasses.actions.COPY_COURSE_CODE,
                                            });
                                        }}
                                        label={section}
                                        size="small"
                                        style={{ margin: '10px 10px 10px 10px' }}
                                        key={index}
                                    />
                                </Tooltip>
                            ))}
                        </Paper>
                    </Box>
                ))
            }

            <CustomEventsBox />

            <ScheduleNoteBox />

            <Typography variant="body1">
                Anteater API is currently unreachable. This is the information that we can currently retrieve.
            </Typography>
        </Box>
    );
}
