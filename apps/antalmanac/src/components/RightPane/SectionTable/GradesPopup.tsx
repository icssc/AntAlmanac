import { useState, useEffect, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Box, Link, Typography, Skeleton } from '@mui/material';
import { useThemeStore } from '$stores/SettingsStore';
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
    const courseGrades = await GradesHelper.queryGrades(deptCode, courseNumber, instructor, false).catch((e) => {
        console.error(e);
        return undefined;
    });

    if (!courseGrades) {
        return undefined;
    }

    const totalGrades = Object.values(Object.entries(courseGrades).filter(([key]) => key !== 'averageGPA')).reduce(
        (acc, [_, value]) => acc + value,
        0
    );

    /**
     * Format data for displaying in chart.
     *
     * @example { gradeACount: 10, gradeBCount: 20 }
     */
    const grades = Object.entries(courseGrades)
        .filter(([key]) => key !== 'averageGPA')
        .map(([key, value]) => {
            return {
                name: key.replace('grade', '').replace('Count', ''),
                all: Number(((value / totalGrades) * 100).toFixed(2)),
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
    const { isDark } = useThemeStore();

    const { deptCode, courseNumber, instructor = '', isMobileScreen } = props;

    const [loading, setLoading] = useState(true);

    const [gradeData, setGradeData] = useState<GradeData>();

    const width = useMemo(() => (isMobileScreen ? 250 : 400), [isMobileScreen]);

    const height = useMemo(() => (isMobileScreen ? 150 : 200), [isMobileScreen]);

    const graphTitle = useMemo(() => {
        return gradeData
            ? `${deptCode} ${courseNumber}${
                  instructor ? ` — ${instructor}` : ''
              } | Average GPA: ${gradeData.courseGrades.averageGPA.toFixed(2)}`
            : 'Grades are not available for this class.';
    }, [gradeData, deptCode, courseNumber, instructor]);

    // const gpaString = useMemo(
    //     () => (gradeData ? `Average GPA: ${gradeData.courseGrades.averageGPA.toFixed(2)}` : ''),
    //     [gradeData]
    // );

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
    const axisColor = isDark ? '#fff' : '#000';

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
                href={`https://zotistics.com/?&selectQuarter=&selectYear=&selectDep=${encodedDept}&classNum=${courseNumber}&code=&submit=Submit`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'flex', height, width }}
            >
                <ResponsiveContainer width="95%" height="95%">
                    <BarChart data={gradeData.grades} style={{ cursor: 'pointer' }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: axisColor }} />
                        <YAxis tick={{ fontSize: 12, fill: axisColor }} width={40} unit="%" />
                        <Tooltip
                            content={({ active, payload, label }) => (
                                <GradeTooltip
                                    active={active !== undefined ? active : false}
                                    payload={payload !== undefined ? (payload as Array<Payload>) : null}
                                    label={label !== undefined ? label : ''} // Ensure label is passed as a string
                                />
                            )}
                            position={{ y: 100 }}
                            offset={-5}
                        />
                        <Bar dataKey="all" fill="#5182ed" />
                    </BarChart>
                </ResponsiveContainer>
            </Link>
        </Box>
    );
}

const GradeTooltip = (props: GradeTooltipProps) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
        return (
            <>
                <Box
                    sx={{
                        backgroundColor: '#5182ed',
                        padding: '5px',
                        border: '1px solid #000',
                        borderRadius: '5px',
                        boxShadow: '0 0 5px 0 rgba(0, 0, 0, 0.5)',
                    }}
                >
                    <Typography variant="body1" align="center" sx={{ color: '#fff', fontWeight: 500 }}>
                        {`${label}: ${payload[0].value}%`}
                    </Typography>
                </Box>
            </>
        );
    }

    return null;
};

export interface GradeTooltipProps {
    active: boolean;
    payload: Array<Payload> | null;
    label: string;
}

export interface Payload {
    name: string;
    value: number;
}

export default GradesPopup;
