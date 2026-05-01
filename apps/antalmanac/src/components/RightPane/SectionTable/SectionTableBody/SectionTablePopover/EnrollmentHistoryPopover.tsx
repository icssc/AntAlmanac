import { useIsMobile } from '$hooks/useIsMobile';
import type { EnrollmentHistory } from '$lib/enrollmentHistory';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { Box, Card, CardContent, CardHeader, IconButton, Skeleton, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { WebsocSectionType } from '@packages/antalmanac-types';
import { useCallback, useMemo, useState } from 'react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';

interface EnrollmentHistoryPopoverProps {
    sectionType: WebsocSectionType;
    department: string;
    courseNumber: string;
    enrollmentHistory: EnrollmentHistory[] | undefined;
    loading?: boolean;
}

export function EnrollmentHistoryPopover({
    sectionType,
    department,
    courseNumber,
    enrollmentHistory,
    loading = false,
}: EnrollmentHistoryPopoverProps) {
    const [selectedGraphIndex, setSelectedGraphIndex] = useState<number>();

    const theme = useTheme();
    const isMobile = useIsMobile();

    const width = isMobile ? 300 : 450;
    const height = isMobile ? 175 : 250;
    const enrollmentHistoryCount = enrollmentHistory?.length ?? 0;

    const activeGraphIndex = useMemo(() => {
        if (!enrollmentHistoryCount) {
            return 0;
        }

        if (selectedGraphIndex == null) {
            return enrollmentHistoryCount - 1;
        }

        return Math.min(Math.max(selectedGraphIndex, 0), enrollmentHistoryCount - 1);
    }, [enrollmentHistoryCount, selectedGraphIndex]);

    const title = `${department} ${courseNumber}`;
    const currEnrollmentHistory = enrollmentHistory?.at(activeGraphIndex);
    const subheader =
        currEnrollmentHistory != null ? (
            `${currEnrollmentHistory.year} ${currEnrollmentHistory.quarter} | ${sectionType} | ${currEnrollmentHistory.sectionCode ?? ''}`
        ) : (
            <>&nbsp;</>
        );

    const chartColors = theme.palette.enrollmentStatus;

    const handleBack = useCallback(() => {
        if (!enrollmentHistoryCount) {
            return;
        }

        setSelectedGraphIndex((currentIndex) => {
            const resolvedIndex = currentIndex ?? enrollmentHistoryCount - 1;
            return Math.max(resolvedIndex - 1, 0);
        });
    }, [enrollmentHistoryCount]);

    const handleForward = useCallback(() => {
        if (!enrollmentHistoryCount) {
            return;
        }

        setSelectedGraphIndex((currentIndex) => {
            const resolvedIndex = currentIndex ?? enrollmentHistoryCount - 1;
            return Math.min(resolvedIndex + 1, enrollmentHistoryCount - 1);
        });
    }, [enrollmentHistoryCount]);

    const navDisabled = loading || enrollmentHistoryCount === 0;

    const headerAction = (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Older Graph">
                <span>
                    <IconButton size="small" onClick={handleBack} disabled={navDisabled || activeGraphIndex === 0}>
                        <ArrowBack />
                    </IconButton>
                </span>
            </Tooltip>
            <Tooltip title="Newer Graph">
                <span>
                    <IconButton
                        size="small"
                        onClick={handleForward}
                        disabled={navDisabled || activeGraphIndex >= enrollmentHistoryCount - 1}
                    >
                        <ArrowForward />
                    </IconButton>
                </span>
            </Tooltip>
        </Box>
    );

    return (
        <Card>
            <CardHeader
                title={title}
                subheader={subheader}
                action={headerAction}
                slotProps={{
                    title: { sx: { fontWeight: 500 }, variant: 'subtitle1' },
                    action: { sx: { alignSelf: 'flex-start', margin: 0 } },
                }}
            />

            <CardContent sx={{ display: 'flex', flexDirection: 'column', paddingTop: 0 }}>
                {loading ? (
                    <Box sx={{ width: width, height: height }}>
                        <Skeleton variant="rectangular" animation="wave" height="100%" width="100%" />
                    </Box>
                ) : enrollmentHistory == null || !enrollmentHistory.length ? (
                    <Typography variant="body1" align="center" color="text.secondary">
                        No past enrollment data found for this course
                    </Typography>
                ) : (
                    <Box sx={{ display: 'flex', height: height, width: width }}>
                        <ResponsiveContainer>
                            <LineChart data={enrollmentHistory[activeGraphIndex].days} style={{ cursor: 'pointer' }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <RechartsTooltip contentStyle={{ backgroundColor: theme.palette.background.paper }} />
                                <Legend wrapperStyle={{ left: 0, width: '100%' }} />

                                <XAxis dataKey="date" tick={{ fontSize: 12, fill: theme.palette.text.primary }} />
                                <YAxis tick={{ fontSize: 12, fill: theme.palette.text.primary }} width={35} />

                                <Line
                                    type="monotone"
                                    dataKey="totalEnrolled"
                                    stroke={chartColors.open}
                                    name="Enrolled"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                    isAnimationActive={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="maxCapacity"
                                    stroke={chartColors.full}
                                    name="Capacity"
                                    strokeWidth={2}
                                    strokeDasharray="16 24"
                                    dot={false}
                                    activeDot={{ r: 3 }}
                                    isAnimationActive={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="waitlist"
                                    stroke={chartColors.waitlist}
                                    name="Waitlist"
                                    strokeWidth={2}
                                    dot={false}
                                    connectNulls
                                    activeDot={{ r: 3 }}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
