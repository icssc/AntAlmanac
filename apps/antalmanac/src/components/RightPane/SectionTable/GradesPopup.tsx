import { useState, useEffect, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Box, Link, Typography, Skeleton } from '@mui/material';
import { isDarkMode } from '$lib/helpers';
import GradesHelper, { type Grades } from '$lib/grades';

export interface GradeData {
    grades: {
        name: string;
        all: number;
    }[];
    courseGrades: Grades;
}

async function getGradeData(
    deptCode: string,
    courseNumber: string,
    instructor: string
): Promise<GradeData | undefined> {
    const courseGrades = await GradesHelper.queryGrades(deptCode, courseNumber, instructor).catch((e) => {
        console.log(e);
        return undefined;
    });

    if (!courseGrades) {
        return undefined;
    }

    /**
     * Format data for displayiing in chart.
     *
     * @example { sum_grade_a_count: 10, sum_grade_b_count: 20 }
     */
    const grades = Object.entries(courseGrades)
        .filter(([key]) => key !== 'averageGPA')
        .map(([key, value]) => {
            return {
                name: key.replace('grade', '').replace('Count', ''),
                all: value,
            };
        });

    return { grades, courseGrades };
}

export interface GradesPopupProps {
    deptCode: string;
    courseNumber: string;
    instructor?: string;
    isMobileScreen: boolean;
}

function GradesPopup(props: GradesPopupProps) {
    const { deptCode, courseNumber, instructor = '', isMobileScreen } = props;

    const [loading, setLoading] = useState(true);

    const [gradeData, setGradeData] = useState<GradeData>();

    const width = useMemo(() => (isMobileScreen ? 300 : 500), [isMobileScreen]);

    const height = useMemo(() => (isMobileScreen ? 200 : 300), [isMobileScreen]);

    const graphTitle = useMemo(() => {
        return gradeData
            ? `Grade Distribution | Average GPA: ${gradeData.courseGrades.averageGPA.toFixed(2)}`
            : 'Grades are not available for this class.';
    }, [gradeData]);

    useEffect(() => {
        if (loading === false) {
            return;
        }

        getGradeData(deptCode, courseNumber, instructor).then((result) => {
            if (result) {
                setGradeData(result);
            }
            setLoading(false);
        });
    }, [loading, deptCode, courseNumber, instructor]);

    if (loading) {
        return (
            <Box padding={1}>
                <Skeleton variant="text" animation="wave" height={height} width={width} />
            </Box>
        );
    }

    if (!gradeData) {
        return (
            <Box padding={1}>
                <Typography variant="body1" align="center">
                    No data available.
                </Typography>
            </Box>
        );
    }

    const encodedDept = encodeURIComponent(deptCode);
    const axisColor = isDarkMode() ? '#fff' : '#111';

    return (
        <Box>
            <Typography
                sx={{
                    marginTop: '.5rem',
                    textAlign: 'center',
                    fontWeight: 500,
                    fontSize: '1.2rem',
                    marginRight: '4rem',
                    marginLeft: '4rem',
                }}
            >
                {graphTitle}
            </Typography>
            <Link
                href={`https://zotistics.com/?&selectQuarter=&selectYear=&selectDep=${encodedDept}&classNum=${courseNumber}&code=&submit=Submit`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'flex', height, width }}
            >
                <ResponsiveContainer width="95%" height="95%">
                    <BarChart data={gradeData.grades} style={{ cursor: 'pointer' }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: axisColor }} />
                        <YAxis tick={{ fontSize: 12, fill: axisColor }} width={40} />
                        <Bar dataKey="all" fill="#5182ed" />
                    </BarChart>
                </ResponsiveContainer>
            </Link>
        </Box>
    );
}

export default GradesPopup;
