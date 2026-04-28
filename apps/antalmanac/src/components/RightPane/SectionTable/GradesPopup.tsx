import { useSecondaryColor } from '$hooks/useSecondaryColor';
import { Grades, type GradesProps } from '$lib/grades';
import {
    Box,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    Card,
    CardHeader,
    CardContent,
    useTheme,
    Skeleton,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';

type GradeView = 'instructor' | 'overall';

export interface GradeData {
    grades: {
        name: string;
        all: number;
    }[];
    courseGrades: GradesProps;
    totalGrades: number;
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

    return { grades, courseGrades, totalGrades };
}

export interface GradesPopupProps {
    deptCode: string;
    courseNumber: string;
    instructor?: string;
    isMobile: boolean;
}

export function GradesPopup(props: GradesPopupProps) {
    const theme = useTheme();
    const accentBlue = useSecondaryColor();

    const { deptCode, courseNumber, instructor = '', isMobile } = props;

    const [loading, setLoading] = useState(true);

    const [instructorData, setInstructorData] = useState<GradeData>();
    const [overallData, setOverallData] = useState<GradeData>();
    const [view, setView] = useState<GradeView>(instructor ? 'instructor' : 'overall');

    const width = isMobile ? 250 : 400;
    const height = isMobile ? 150 : 200;

    const activeData = view === 'instructor' ? instructorData : overallData;
    const hasData = activeData?.grades.some((g) => g.all > 0);
    const title = `${deptCode} ${courseNumber}`;
    const subheader =
        activeData?.courseGrades.averageGPA != null
            ? `Average GPA: ${activeData.courseGrades.averageGPA.toFixed(2)} (${activeData.totalGrades} students)`
            : '';

    const handleViewChange = (_event: React.MouseEvent<HTMLElement>, newView: GradeView | null) => {
        if (newView !== null) {
            setView(newView);
        }
    };

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

    return (
        <Card>
            <CardHeader
                title={title}
                subheader={subheader}
                action={
                    <ToggleButtonGroup value={view} exclusive onChange={handleViewChange} size="small">
                        <ToggleButton
                            value="instructor"
                            sx={{
                                textTransform: 'none',
                                paddingY: 0.25,
                            }}
                        >
                            {instructor}
                        </ToggleButton>
                        <ToggleButton
                            value="overall"
                            sx={{
                                textTransform: 'none',
                                paddingY: 0.25,
                            }}
                        >
                            Overall
                        </ToggleButton>
                    </ToggleButtonGroup>
                }
                slotProps={{
                    title: { sx: { fontWeight: 500 }, variant: 'subtitle1' },
                    action: { sx: { alignSelf: 'flex-start', margin: 0 } },
                }}
            />

            <CardContent sx={{ display: 'flex', minWidth: width, paddingTop: 0 }}>
                {loading ? (
                    <Box sx={{ width, height }}>
                        <Skeleton variant="rectangular" animation="wave" height="100%" width="100%" />
                    </Box>
                ) : activeData && hasData ? (
                    <Box sx={{ width, height }}>
                        <ResponsiveContainer>
                            <BarChart data={activeData.grades} style={{ cursor: 'pointer' }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12, fill: theme.palette.text.primary }}
                                    height={20}
                                />
                                <YAxis tick={{ fontSize: 12, fill: theme.palette.text.primary }} unit="%" width={35} />
                                <RechartsTooltip
                                    contentStyle={{
                                        backgroundColor: accentBlue,
                                        border: 'none',
                                        borderRadius: 4,
                                    }}
                                    labelStyle={{
                                        color: theme.palette.mode === 'dark' ? '#212529' : '#fff',
                                    }}
                                    itemStyle={{
                                        color: theme.palette.mode === 'dark' ? '#212529' : '#fff',
                                    }}
                                />
                                <Bar dataKey="all" fill={accentBlue} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                ) : (
                    <Typography variant="body1" align="center" color="text.secondary">
                        {view === 'instructor'
                            ? "This instructor doesn't have a specific GPA for this course."
                            : 'No data available.'}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}
