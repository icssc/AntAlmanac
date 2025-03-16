import { Box, Typography, Paper, Chip, Tooltip } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { CustomEventsTable } from '$components/RightPane/AddedCoursePane/CustomEventsTable';
import { ScheduleNote } from '$components/RightPane/AddedCoursePane/ScheduleNote';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { clickToCopy } from '$lib/helpers';
import AppStore from '$stores/AppStore';

export function FallbackSchedule() {
    const [skeletonSchedule, setSkeletonSchedule] = useState(() => AppStore.getCurrentSkeletonSchedule());

    useEffect(() => {
        const updateSkeletonSchedule = () => {
            setSkeletonSchedule(AppStore.getCurrentSkeletonSchedule());
        };

        AppStore.on('skeletonScheduleChange', updateSkeletonSchedule);
        AppStore.on('currentScheduleIndexChange', updateSkeletonSchedule);

        return () => {
            AppStore.off('skeletonScheduleChange', updateSkeletonSchedule);
            AppStore.off('currentScheduleIndexChange', updateSkeletonSchedule);
        };
    }, []);

    const sectionsByTerm: [string, string[]][] = useMemo(() => {
        const result = skeletonSchedule.courses.reduce(
            (accumulated, course) => {
                accumulated[course.term] ??= [];
                accumulated[course.term].push(course.sectionCode);
                return accumulated;
            },
            {} as Record<string, string[]>
        );

        return Object.entries(result);
    }, [skeletonSchedule.courses]);

    return (
        <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">{skeletonSchedule.scheduleName}</Typography>
            {
                // Sections organized under terms, in case the schedule contains multiple terms
                sectionsByTerm.map(([term, sections]) => (
                    <Box key={term}>
                        <Typography variant="h6">{term}</Typography>
                        <Paper key={term} elevation={1}>
                            {sections.map((section, index) => (
                                <Tooltip title="Click to copy course code" placement="right" key={index}>
                                    <Chip
                                        onClick={(event) => {
                                            clickToCopy(event, section);
                                            logAnalytics({
                                                category: analyticsEnum.classSearch.title,
                                                action: analyticsEnum.classSearch.actions.COPY_COURSE_CODE,
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

            <CustomEventsTable />

            <ScheduleNote />

            <Typography variant="body1">
                Anteater API is currently unreachable. This is the information that we can currently retrieve.
            </Typography>
        </Box>
    );
}
