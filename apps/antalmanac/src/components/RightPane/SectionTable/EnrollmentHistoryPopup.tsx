import { useState, useEffect, useMemo } from 'react';
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
import { ArrowBack, ArrowForward } from '@material-ui/icons';
import { Box, IconButton, Link, Typography, Skeleton, Tooltip, useMediaQuery } from '@mui/material';
import { MOBILE_BREAKPOINT } from '../../../globals';
import { DepartmentEnrollmentHistory, EnrollmentHistory } from '$lib/enrollmentHistory';
import { isDarkMode } from '$lib/helpers';

export interface EnrollmentHistoryPopupProps {
    department: string;
    courseNumber: string;
}

export function EnrollmentHistoryPopup({ department, courseNumber }: EnrollmentHistoryPopupProps) {
    const [loading, setLoading] = useState(true);
    const [enrollmentHistory, setEnrollmentHistory] = useState<EnrollmentHistory[]>();
    const [graphIndex, setGraphIndex] = useState(0);

    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT})`);

    const deptEnrollmentHistory = useMemo(() => new DepartmentEnrollmentHistory(department), [department]);

    const graphWidth = useMemo(() => (isMobileScreen ? 250 : 400), [isMobileScreen]);
    const graphHeight = useMemo(() => (isMobileScreen ? 150 : 225), [isMobileScreen]);
    const popupTitle = useMemo(() => {
        if (enrollmentHistory == null) {
            return 'No past enrollment data found for this course';
        }

        const currEnrollmentHistory = enrollmentHistory[graphIndex];
        return `${department} ${courseNumber} | ${currEnrollmentHistory.year} ${
            currEnrollmentHistory.quarter
        } | ${currEnrollmentHistory.instructors.join(', ')}`;
    }, [courseNumber, department, enrollmentHistory, graphIndex]);

    const encodedDept = useMemo(() => encodeURIComponent(department), [department]);
    const axisColor = isDarkMode() ? '#fff' : '#111';
    const tooltipDateColor = '#111';

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

    const handleBack = () => {
        setGraphIndex((prev) => prev - 1);
    };

    const handleForward = () => {
        setGraphIndex((prev) => prev + 1);
    };

    return (
        <Box sx={{ padding: 0.5 }}>
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
            <Link
                href={`https://zot-tracker.herokuapp.com/?dept=${encodedDept}&number=${courseNumber}&courseType=all`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'flex', height: graphHeight, width: graphWidth }}
            >
                <ResponsiveContainer width="95%" height="95%">
                    <LineChart data={enrollmentHistory[graphIndex].days} style={{ cursor: 'pointer' }}>
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
