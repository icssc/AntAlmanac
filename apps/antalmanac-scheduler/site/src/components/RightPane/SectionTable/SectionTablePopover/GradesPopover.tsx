import { SectionTablePopoverSubheader } from '$components/RightPane/SectionTable/SectionTablePopover/SectionTablePopoverSubheader';
import { getRenamedCoursesLabel, isGradeDistributionKeyCount } from '$lib/renames/utils';
import { getInstructorGradesFromSection, useSectionGrades } from '$stores/CourseGradesStore';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Skeleton,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import type { AggregateGrades } from '@packages/anteater-api/types';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

const GradesPopoverChart = dynamic(
    () => import('./GradesPopoverChart').then((m) => ({ default: m.GradesPopoverChart })),
    {
        ssr: false,
        loading: () => <Skeleton variant="rectangular" animation="wave" height="100%" width="100%" />,
    }
);

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
        .filter(([key]) => isGradeDistributionKeyCount(key))
        .reduce((acc, [, value]) => acc + (value as number), 0);

    const grades = Object.entries(courseGrades)
        .filter(([key]) => isGradeDistributionKeyCount(key))
        .map(([key, value]) => ({
            name: key.replace('grade', '').replace('Count', ''),
            all: Number((((value as number) / totalGrades) * 100).toFixed(2)),
        }));

    return { grades, courseGrades, totalGrades };
}

interface GradesPopoverProps {
    deptCode: string;
    courseNumber: string;
    sectionCode: string;
    instructor?: string;
    isMobile: boolean;
}

export function GradesPopover({ deptCode, courseNumber, sectionCode, instructor = '', isMobile }: GradesPopoverProps) {
    const { overallGrades, areOverallGradesLoading, sectionInstructorGrades, areSectionInstructorGradesLoading } =
        useSectionGrades(sectionCode);
    const predecessorLabel = getRenamedCoursesLabel(deptCode, courseNumber);

    const loading = areOverallGradesLoading || areSectionInstructorGradesLoading;

    const [view, setView] = useState<GradeView>(instructor ? 'instructor' : 'overall');

    const width = isMobile ? 280 : 400;
    const height = isMobile ? 180 : 240;

    const overallData = useMemo(() => toGradeData(overallGrades), [overallGrades]);
    const instructorData = useMemo(
        () =>
            sectionInstructorGrades
                ? toGradeData(getInstructorGradesFromSection(sectionInstructorGrades).instructorGrades)
                : null,
        [sectionInstructorGrades]
    );

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
                subheader={<SectionTablePopoverSubheader subheader={subheader} predecessorLabel={predecessorLabel} />}
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
                        <GradesPopoverChart grades={activeData.grades} />
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
                        <Typography variant="body1" sx={{ color: (theme) => theme.vars.palette.text.secondary }}>
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
