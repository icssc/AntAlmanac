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

function graphKey(enrollment: EnrollmentHistory) {
    return `${enrollment.year}-${enrollment.quarter}-${enrollment.instructors.join('|')}`;
}

export function EnrollmentHistoryPopover({
    sectionType,
    department,
    courseNumber,
    enrollmentHistory,
    loading = false,
}: EnrollmentHistoryPopoverProps) {
    const [selectedGraphKey, setSelectedGraphKey] = useState<string>();

    const theme = useTheme();
    const isMobile = useIsMobile();

    const width = isMobile ? 250 : 450;
    const height = isMobile ? 175 : 250;

    const activeGraphIndex = useMemo(() => {
        if (!enrollmentHistory?.length) {
            return 0;
        }

        if (selectedGraphKey) {
            const selectedIndex = enrollmentHistory.findIndex(
                (enrollment) => graphKey(enrollment) === selectedGraphKey
            );

            if (selectedIndex >= 0) {
                return selectedIndex;
            }
        }
        return enrollmentHistory.length - 1;
    }, [enrollmentHistory, selectedGraphKey]);

    const title = `${department} ${courseNumber}`;
    const currEnrollmentHistory = enrollmentHistory?.at(activeGraphIndex);
    const subheader =
        currEnrollmentHistory != null
            ? `${currEnrollmentHistory.year} ${currEnrollmentHistory.quarter} | ${sectionType}`
            : '';

    const chartColors = theme.palette.enrollmentStatus;

    const handleBack = useCallback(() => {
        if (!enrollmentHistory?.length || activeGraphIndex === 0) {
            return;
        }
        setSelectedGraphKey(graphKey(enrollmentHistory[activeGraphIndex - 1]));
    }, [activeGraphIndex, enrollmentHistory]);

    const handleForward = useCallback(() => {
        if (!enrollmentHistory?.length || activeGraphIndex === enrollmentHistory.length - 1) {
            return;
        }
        setSelectedGraphKey(graphKey(enrollmentHistory[activeGraphIndex + 1]));
    }, [activeGraphIndex, enrollmentHistory]);

    const historyCount = enrollmentHistory?.length ?? 0;
    const navDisabled = loading || historyCount === 0;

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
                        disabled={navDisabled || activeGraphIndex >= historyCount - 1}
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
