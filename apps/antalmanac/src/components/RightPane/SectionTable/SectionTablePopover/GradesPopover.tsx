import { trpcReact } from '$lib/api/trpc';
import { getPredecessorLabel } from '$lib/courseRenames';
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
import type { AggregateGrades } from '@packages/anteater-api/types';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';

type GradeView = 'instructor' | 'overall';

interface GradeData {
    grades: {
        name: string;
        all: number;
    }[];
    courseGrades: NonNullable<AggregateGrades>['gradeDistribution'];
    totalGrades: number;
}

function toGradeData(
    courseGrades: NonNullable<AggregateGrades>['gradeDistribution'] | null | undefined
): GradeData | undefined {
    if (!courseGrades) {
        return undefined;
    }

    const totalGrades = Object.entries(courseGrades)
        .filter(([key]) => key !== 'averageGPA')
        .reduce((acc, [, value]) => acc + (value as number), 0);

    const grades = Object.entries(courseGrades)
        .filter(([key]) => key !== 'averageGPA')
        .map(([key, value]) => ({
            name: key.replace('grade', '').replace('Count', ''),
            all: Number((((value as number) / totalGrades) * 100).toFixed(2)),
        }));

    return { grades, courseGrades, totalGrades };
}

interface GradesPopoverProps {
    deptCode: string;
    courseNumber: string;
    instructor?: string;
    isMobile: boolean;
}

export function GradesPopover(props: GradesPopoverProps) {
    const theme = useTheme();
    const secondaryColor = theme.palette.secondary.main;

    const { deptCode, courseNumber, instructor = '', isMobile } = props;
    const predecessorLabel = getPredecessorLabel(deptCode, courseNumber);

    const { data: overallGrades, isLoading: overallLoading } = trpcReact.grades.aggregateGrades.useQuery(
        { department: deptCode, courseNumber, instructor: '' },
        { select: (data) => data?.gradeDistribution ?? null }
    );
    const { data: instructorGrades, isLoading: instructorLoading } = trpcReact.grades.aggregateGrades.useQuery(
        { department: deptCode, courseNumber, instructor },
        { select: (data) => data?.gradeDistribution ?? null, enabled: !!instructor }
    );

    const loading = overallLoading || (!!instructor && instructorLoading);

    const [view, setView] = useState<GradeView>(instructor ? 'instructor' : 'overall');

    const width = isMobile ? 280 : 400;
    const height = isMobile ? 180 : 240;

    const overallData = useMemo(() => toGradeData(overallGrades), [overallGrades]);
    const instructorData = useMemo(() => toGradeData(instructorGrades), [instructorGrades]);

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

    return (
        <Card>
            <CardHeader
                title={title}
                subheader={
                    <>
                        {subheader || (!predecessorLabel && <>&nbsp;</>)}
                        {subheader && predecessorLabel && <br />}
                        {predecessorLabel}
                    </>
                }
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
                                        backgroundColor: theme.palette.background.paper,
                                        border: 0,
                                    }}
                                    labelStyle={{ color: secondaryColor }}
                                    itemStyle={{ color: secondaryColor }}
                                    labelFormatter={(gradeLabel) => `Grade ${gradeLabel}`}
                                    formatter={(value) => {
                                        const n = typeof value === 'number' ? value : Number(value);
                                        const pct = Number.isFinite(n) ? n.toFixed(1) : String(value);
                                        return [`${pct}%`];
                                    }}
                                />
                                <Bar dataKey="all" fill={theme.palette.primary.main} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            width,
                            height,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            px: 1,
                        }}
                    >
                        <Typography variant="body1" color="text.secondary">
                            {view === 'instructor'
                                ? "This instructor doesn't have a specific GPA for this course."
                                : 'No data available.'}
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
