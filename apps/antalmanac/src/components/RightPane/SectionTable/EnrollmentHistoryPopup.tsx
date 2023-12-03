import { useState, useEffect } from 'react';
import { LineChart, Line, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Box, Link, Typography, Skeleton } from '@mui/material';
import EnrollmentHistoryHelper, { EnrollmentHistory } from '$lib/enrollmentHistory';
import { isDarkMode } from '$lib/helpers';

export interface EnrollmentHistoryProps {
    department: string;
    courseNumber: string;
    sectionType: string;
    isMobileScreen: boolean;
}

const EnrollmentHistoryPopup = (props: EnrollmentHistoryProps) => {
    const { department, courseNumber, sectionType, isMobileScreen } = props;
    const [loading, setLoading] = useState(true);
    const [enrollmentHistory, setEnrollmentHistory] = useState<EnrollmentHistory>();

    const graphWidth = isMobileScreen ? 250 : 450;
    const graphHeight = isMobileScreen ? 175 : 250;
    const graphTitle = enrollmentHistory
        ? `${department} ${courseNumber} | ${enrollmentHistory.year} ${
              enrollmentHistory.quarter
          } | ${enrollmentHistory.instructors.join(', ')}`
        : 'No past enrollment data found for this course';

    const axisColor = isDarkMode() ? '#fff' : '#111';
    const tooltipDateColor = '#111';

    useEffect(() => {
        if (!loading) {
            return;
        }

        EnrollmentHistoryHelper.queryEnrollmentHistory(department, courseNumber, sectionType).then(
            (enrollmentHistory) => {
                if (enrollmentHistory) {
                    setEnrollmentHistory(enrollmentHistory);
                }

                setLoading(false);
            }
        );
    }, [loading, department, courseNumber, sectionType]);

    if (loading) {
        return (
            <Box padding={1}>
                <Skeleton variant="text" animation="wave" height={graphHeight} width={graphWidth} />
            </Box>
        );
    }

    if (!enrollmentHistory) {
        return (
            <Box padding={1}>
                <Typography variant="body1" align="center">
                    No past enrollment data found for this course
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ padding: '4px' }}>
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
                {graphTitle}
            </Typography>
            <Link
                href={`https://zot-tracker.herokuapp.com/?dept=${encodeURIComponent(
                    department
                )}&number=${courseNumber}&courseType=all`}
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
};

export default EnrollmentHistoryPopup;
