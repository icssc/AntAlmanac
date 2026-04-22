import { Grades, type GradesProps } from '$lib/grades';
import { useThemeStore } from '$stores/SettingsStore';
import { Box, Link, ToggleButton, ToggleButtonGroup, Typography, Skeleton } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type GradeView = 'instructor' | 'overall';

export interface GradeData {
    grades: {
        name: string;
        all: number;
    }[];
    courseGrades: GradesProps;
}

async function getGradeData(
    deptCode: string,
    courseNumber: string,
    instructor: string
): Promise<GradeData | undefined> {
    const courseGrades = await Grades.queryGrades(deptCode, courseNumber, instructor, false).catch((e) => {
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
    isMobile: boolean;
}

function GradesPopup(props: GradesPopupProps) {
    const { isDark } = useThemeStore();

    const { deptCode, courseNumber, instructor = '', isMobile } = props;

    const [loading, setLoading] = useState(true);

    const [instructorData, setInstructorData] = useState<GradeData>();
    const [overallData, setOverallData] = useState<GradeData>();
    const [view, setView] = useState<GradeView>(instructor ? 'instructor' : 'overall');

    const width = useMemo(() => (isMobile ? 250 : 400), [isMobile]);

    const height = useMemo(() => (isMobile ? 150 : 200), [isMobile]);

    const activeData = view === 'instructor' ? instructorData : overallData;

    const graphTitle = useMemo(() => {
        if (!activeData) {
            return 'Grades are not available for this class.';
        }
        const instructorLabel = view === 'instructor' && instructor ? ` — ${instructor}` : '';
        // GPA is `null` if the class is pass/no-pass only.
        return `${deptCode} ${courseNumber}${instructorLabel} | Average GPA: ${
            activeData.courseGrades.averageGPA?.toFixed(2) ?? 'n/a'
        }`;
    }, [activeData, view, deptCode, courseNumber, instructor]);

    useEffect(() => {
        if (loading === false) {
            return;
        }

        const fetches: Promise<unknown>[] = [
            getGradeData(deptCode, courseNumber, '').then((result) => {
                if (result) setOverallData(result);
            }),
        ];

        if (instructor) {
            fetches.push(
                getGradeData(deptCode, courseNumber, instructor).then((result) => {
                    if (result) setInstructorData(result);
                })
            );
        }

        Promise.all(fetches).finally(() => setLoading(false));
    }, [loading, deptCode, courseNumber, instructor]);

    const handleViewChange = (_event: React.MouseEvent<HTMLElement>, newView: GradeView | null) => {
        if (newView !== null) {
            setView(newView);
        }
    };

    if (loading) {
        return (
            <Box padding={1}>
                <Skeleton variant="text" animation="wave" height={height} width={width} />
            </Box>
        );
    }

    if (!activeData) {
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

                {instructor && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '.5rem' }}>
                        <ToggleButtonGroup value={view} exclusive onChange={handleViewChange} size="small">
                            <ToggleButton
                                value="instructor"
                                sx={{
                                    textTransform: 'none',
                                    paddingX: 1,
                                    paddingY: 0.25,
                                    fontSize: '0.75rem',
                                    minHeight: '24px',
                                }}
                            >
                                {instructor}
                            </ToggleButton>
                            <ToggleButton
                                value="overall"
                                sx={{
                                    textTransform: 'none',
                                    paddingX: 1,
                                    paddingY: 0.25,
                                    fontSize: '0.75rem',
                                    minHeight: '24px',
                                }}
                            >
                                Overall
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                )}
            </Typography>
            <Link
                href={`https://zotistics.com/?&selectQuarter=&selectYear=&selectDep=${encodedDept}&classNum=${courseNumber}&code=&submit=Submit`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'flex', height, width }}
            >
                <ResponsiveContainer width="95%" height="95%">
                    <BarChart data={activeData.grades} style={{ cursor: 'pointer' }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: axisColor }} />
                        <YAxis tick={{ fontSize: 12, fill: axisColor }} width={40} unit="%" />
                        <Tooltip
                            content={({ active, payload, label }) => (
                                <GradeTooltip
                                    active={active ?? false}
                                    payload={(payload as Array<Payload>) ?? null}
                                    label={label ?? ''}
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
