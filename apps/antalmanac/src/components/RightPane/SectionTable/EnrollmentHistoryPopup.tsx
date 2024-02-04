import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Box, Link, Typography, Skeleton, useMediaQuery } from '@mui/material';
import { MOBILE_BREAKPOINT } from '../../../globals';
import { DepartmentEnrollmentHistory, EnrollmentHistory } from '$lib/enrollmentHistory';
import { useThemeStore } from '$stores/SettingsStore';

export interface EnrollmentHistoryPopupProps {
    department: string;
    courseNumber: string;
}

export function EnrollmentHistoryPopup({ department, courseNumber }: EnrollmentHistoryPopupProps) {
    const [loading, setLoading] = useState(true);
    const [enrollmentHistory, setEnrollmentHistory] = useState<EnrollmentHistory>();
    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT})`);

    const deptEnrollmentHistory = useMemo(() => new DepartmentEnrollmentHistory(department), [department]);

    const graphWidth = useMemo(() => (isMobileScreen ? 250 : 450), [isMobileScreen]);
    const graphHeight = useMemo(() => (isMobileScreen ? 175 : 250), [isMobileScreen]);
    const popupTitle = useMemo(() => {
        if (enrollmentHistory == null) {
            return 'No past enrollment data found for this course';
        }

        return `${department} ${courseNumber} | ${enrollmentHistory.year} ${
            enrollmentHistory.quarter
        } | ${enrollmentHistory.instructors.join(', ')}`;
    }, [courseNumber, department, enrollmentHistory]);
    const isDark = useThemeStore((state) => state.isDark);
    const encodedDept = useMemo(() => encodeURIComponent(department), [department]);
    const axisColor = isDark ? '#fff' : '#111';
    const tooltipDateColor = '#111';

    useEffect(() => {
        if (!loading) {
            return;
        }

        deptEnrollmentHistory.find(courseNumber).then((data) => {
            if (data) {
                setEnrollmentHistory(data);
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

    return (
        <Box sx={{ padding: 0.5 }}>
            <Typography
                sx={{
                    marginTop: '.5rem',
                    textAlign: 'center',
                    fontWeight: 500,
                    marginRight: '2rem',
                    marginLeft: '2rem',
                    marginBottom: '.5rem',
                }}
            >
                {popupTitle}
            </Typography>
            <Link
                href={`https://zot-tracker.herokuapp.com/?dept=${encodedDept}&number=${courseNumber}&courseType=all`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'flex', height: graphHeight, width: graphWidth }}
            >
                <ResponsiveContainer width="95%" height="95%">
                    <LineChart data={enrollmentHistory.days} style={{ cursor: 'pointer' }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: axisColor }} />
                        <YAxis tick={{ fontSize: 12, fill: axisColor }} width={40} />
                        <Tooltip labelStyle={{ color: tooltipDateColor }} />
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
