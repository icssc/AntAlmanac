import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { Box, IconButton, Link, Typography, Skeleton, Tooltip, useMediaQuery } from '@mui/material';
import { MOBILE_BREAKPOINT } from '../../../globals';
import { DepartmentEnrollmentHistory, EnrollmentHistory } from '$lib/enrollmentHistory';
import { useThemeStore } from '$stores/SettingsStore';

interface PopupHeaderProps {
    graphWidth: number;
    graphIndex: number;
    handleForward: () => void;
    handleBack: () => void;
    popupTitle: string;
    enrollmentHistory: EnrollmentHistory[];
}

function PopupHeader({
    graphWidth,
    graphIndex,
    handleForward,
    handleBack,
    popupTitle,
    enrollmentHistory,
}: PopupHeaderProps) {
    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT})`);

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: graphWidth,
            }}
        >
            <Tooltip title="Newer Graph">
                {/* In order for a tooltip to work properly with disabled buttons, we need to wrap the button in a span */}
                <span>
                    <IconButton onClick={handleBack} disabled={graphIndex === 0}>
                        <ArrowBack />
                    </IconButton>
                </span>
            </Tooltip>
            <Typography sx={{ fontWeight: 500, fontSize: isMobileScreen ? '0.8rem' : '1rem', textAlign: 'center' }}>
                {popupTitle}
            </Typography>
            <Tooltip title="Older Graph">
                <span>
                    <IconButton onClick={handleForward} disabled={graphIndex === enrollmentHistory.length - 1}>
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
}

export function EnrollmentHistoryPopup({ department, courseNumber }: EnrollmentHistoryPopupProps) {
    const [loading, setLoading] = useState(true);
    const [enrollmentHistory, setEnrollmentHistory] = useState<EnrollmentHistory[]>();
    const [graphIndex, setGraphIndex] = useState(0);

    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT})`);

    const deptEnrollmentHistory = useMemo(() => new DepartmentEnrollmentHistory(department), [department]);

    const graphWidth = useMemo(() => (isMobileScreen ? 250 : 450), [isMobileScreen]);
    const graphHeight = useMemo(() => (isMobileScreen ? 175 : 250), [isMobileScreen]);
    const popupTitle = useMemo(() => {
        if (enrollmentHistory == null) {
            return 'No past enrollment data found for this course';
        }

        const currEnrollmentHistory = enrollmentHistory[graphIndex];
        return `${department} ${courseNumber} | ${currEnrollmentHistory.year} ${
            currEnrollmentHistory.quarter
        } | ${currEnrollmentHistory.instructors.join(', ')}`;
    }, [courseNumber, department, enrollmentHistory, graphIndex]);
    const isDark = useThemeStore((state) => state.isDark);
    const encodedDept = useMemo(() => encodeURIComponent(department), [department]);
    const axisColor = isDark ? '#fff' : '#111';
    const tooltipDateColor = '#111';

    const handleBack = useCallback(() => {
        setGraphIndex((prev) => prev - 1);
    }, []);

    const handleForward = useCallback(() => {
        setGraphIndex((prev) => prev + 1);
    }, []);

    useEffect(() => {
        if (!loading) {
            return;
        }

        deptEnrollmentHistory.find(courseNumber).then((data) => {
            if (data) {
                setEnrollmentHistory(data);
                setGraphIndex(0);
            }
            setLoading(false);
        });
    }, [loading, deptEnrollmentHistory, courseNumber]);

    if (loading) {
        return (
            <Box padding={1}>
                <Skeleton variant="text" animation="wave" height={graphHeight} width={graphWidth} />
            </Box>
        );
    }

    if (enrollmentHistory == null) {
        return (
            <Box padding={1}>
                <Typography variant="body1" align="center">
                    {popupTitle}
                </Typography>
            </Box>
        );
    }

    const lineChartData = enrollmentHistory[graphIndex].days;

    return (
        <Box sx={{ padding: 0.5 }}>
            <PopupHeader
                graphWidth={graphWidth}
                graphIndex={graphIndex}
                handleForward={handleForward}
                handleBack={handleBack}
                popupTitle={popupTitle}
                enrollmentHistory={enrollmentHistory}
            />
            <Link
                href={`https://zot-tracker.herokuapp.com/?dept=${encodedDept}&number=${courseNumber}&courseType=all`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'flex', height: graphHeight, width: graphWidth }}
            >
                <ResponsiveContainer width="95%" height="95%">
                    <LineChart data={lineChartData} style={{ cursor: 'pointer' }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: axisColor }} />
                        <YAxis tick={{ fontSize: 12, fill: axisColor }} width={40} />
                        <RechartsTooltip labelStyle={{ color: tooltipDateColor }} />
                        <Legend />
                        <Line type="monotone" dataKey="totalEnrolled" stroke="#8884d8" name="Enrolled" dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="maxCapacity" stroke="#82ca9d" name="Max" dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="waitlist" stroke="#ffc658" name="Waitlist" dot={{ r: 2 }} />
                    </LineChart>
                </ResponsiveContainer>
            </Link>
        </Box>
    );
}
