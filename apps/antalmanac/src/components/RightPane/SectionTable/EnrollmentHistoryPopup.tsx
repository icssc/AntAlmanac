import { useIsMobile } from '$hooks/useIsMobile';
import { EnrollmentHistory } from '$lib/enrollmentHistory';
import { useThemeStore } from '$stores/SettingsStore';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { Box, IconButton, Skeleton, Tooltip, Typography } from '@mui/material';
import { useState, useMemo, useCallback } from 'react';
import {
    LineChart,
    Line,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    Legend,
} from 'recharts';

type PopupHeaderCallback = () => void;
const ENROLLMENT_STATUS_COLORS_LIGHT = {
    open: '#00c853',
    waitlist: '#ff9800',
    full: '#e53935',
} as const;

const ENROLLMENT_STATUS_COLORS_DARK = {
    open: '#00c853',
    waitlist: '#f5c518',
    full: '#e53935',
} as const;

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
    const isMobile = useIsMobile();

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
            <Typography sx={{ fontWeight: 500, fontSize: isMobile ? '0.8rem' : '1rem', textAlign: 'center' }}>
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

interface EnrollmentHistoryPopupProps {
    department: string;
    courseNumber: string;
    enrollmentHistory?: EnrollmentHistory[] | null;
    loading?: boolean;
}

function graphKey(enrollment: EnrollmentHistory) {
    return `${enrollment.year}-${enrollment.quarter}-${enrollment.instructors.join('|')}`;
}

export function EnrollmentHistoryPopup({
    department,
    courseNumber,
    enrollmentHistory,
    loading = false,
}: EnrollmentHistoryPopupProps) {
    const [selectedGraphKey, setSelectedGraphKey] = useState<string>();

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
        if (enrollmentHistory == null) {
            return 'No past enrollment data found for this course';
        }

        const currEnrollmentHistory = enrollmentHistory[activeGraphIndex];
        return `${department} ${courseNumber} | ${currEnrollmentHistory.year} ${
            currEnrollmentHistory.quarter
        } | ${currEnrollmentHistory.instructors.join(', ')}`;
    }, [activeGraphIndex, courseNumber, department, enrollmentHistory]);
    const isDark = useThemeStore((state) => state.isDark);
    const axisColor = isDark ? '#fff' : '#111';
    const tooltipDateColor = isDark ? '#f5f5f5' : '#111';
    const tooltipBackgroundColor = isDark ? '#1f1f1f' : '#fff';
    const chartColors = isDark ? ENROLLMENT_STATUS_COLORS_DARK : ENROLLMENT_STATUS_COLORS_LIGHT;

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
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: axisColor }} />
                        <YAxis tick={{ fontSize: 12, fill: axisColor }} width={48} />
                        <RechartsTooltip
                            labelStyle={{ color: tooltipDateColor }}
                            contentStyle={{
                                backgroundColor: tooltipBackgroundColor,
                                borderRadius: 8,
                                border: `1px solid ${isDark ? '#3a3a3a' : '#d8d8d8'}`,
                            }}
                            itemStyle={{ color: tooltipDateColor }}
                        />
                        <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 12 }} />
                        <Line
                            type="monotone"
                            dataKey="totalEnrolled"
                            stroke={chartColors.open}
                            name="Enrolled"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="maxCapacity"
                            stroke={chartColors.full}
                            name="Capacity"
                            strokeWidth={2}
                            strokeDasharray="6 4"
                            dot={false}
                            activeDot={{ r: 3 }}
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
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
}
