import { useIsMobile } from '$hooks/useIsMobile';
import type { EnrollmentHistory } from '$lib/enrollmentHistory';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { Box, IconButton, Skeleton, Tooltip, Typography } from '@mui/material';
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

type PopupHeaderCallback = () => void;

interface PopupHeaderProps {
    graphWidth: number;
    graphIndex: number;
    handleForward: PopupHeaderCallback;
    handleBack: PopupHeaderCallback;
    popupTitle: string;
    historyCount: number;
}

function PopupHeader({
    graphWidth,
    graphIndex,
    handleForward,
    handleBack,
    popupTitle,
    historyCount,
}: PopupHeaderProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: graphWidth,
            }}
        >
            <Tooltip title="Older Graph">
                {/* In order for a tooltip to work properly with disabled buttons, we need to wrap the button in a span */}
                <span>
                    <IconButton onClick={handleBack} disabled={graphIndex === 0}>
                        <ArrowBack />
                    </IconButton>
                </span>
            </Tooltip>
            <Typography
                sx={{
                    fontWeight: 500,
                    textAlign: 'center',
                }}
            >
                {popupTitle}
            </Typography>
            <Tooltip title="Newer Graph">
                <span>
                    <IconButton onClick={handleForward} disabled={graphIndex === historyCount - 1}>
                        <ArrowForward />
                    </IconButton>
                </span>
            </Tooltip>
        </Box>
    );
}

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

    const graphWidth = useMemo(() => (isMobile ? 250 : 450), [isMobile]);
    const graphHeight = useMemo(() => (isMobile ? 175 : 250), [isMobile]);
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

    const popupTitle = useMemo(() => {
        const currEnrollmentHistory = enrollmentHistory?.at(activeGraphIndex);

        if (!currEnrollmentHistory) {
            return 'No past enrollment data found for this course';
        }

        const instructor = currEnrollmentHistory.instructors.at(0) ?? 'Unknown instructor';
        const term = `${currEnrollmentHistory.year} ${currEnrollmentHistory.quarter}`;

        return `${department} ${courseNumber} — ${instructor} | ${sectionType} | ${term}`;
    }, [activeGraphIndex, courseNumber, department, enrollmentHistory, sectionType]);

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

    if (loading) {
        return (
            <Box padding={1}>
                <Skeleton variant="text" animation="wave" height={graphHeight} width={graphWidth} />
            </Box>
        );
    }

    if (enrollmentHistory == null || !enrollmentHistory.length) {
        return (
            <Box padding={1}>
                <Typography variant="body1" align="center">
                    {popupTitle}
                </Typography>
            </Box>
        );
    }

    const lineChartData = enrollmentHistory[activeGraphIndex].days;

    return (
        <Box sx={{ padding: 0.5 }}>
            <PopupHeader
                graphWidth={graphWidth}
                graphIndex={activeGraphIndex}
                handleForward={handleForward}
                handleBack={handleBack}
                popupTitle={popupTitle}
                historyCount={enrollmentHistory.length}
            />

            <Box sx={{ display: 'flex', height: graphHeight, width: graphWidth }}>
                <ResponsiveContainer width="95%" height="95%">
                    <LineChart
                        data={lineChartData}
                        style={{ cursor: 'pointer' }}
                        margin={{ top: 8, right: 16, left: 4 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <RechartsTooltip contentStyle={{ backgroundColor: theme.palette.background.paper }} />
                        <Legend wrapperStyle={{ left: 0, width: '100%' }} />

                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: theme.palette.text.primary }} />
                        <YAxis tick={{ fontSize: 12, fill: theme.palette.text.primary }} width={48} />

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
        </Box>
    );
}
