import { SectionTablePopoverSubheader } from '$components/RightPane/SectionTable/SectionTablePopover/SectionTablePopoverSubheader';
import { useIsMobile } from '$hooks/useIsMobile';
import { trpcReact } from '$lib/api/trpc';
import { parseAndSortEnrollmentHistory, type EnrollmentHistory } from '$lib/enrollmentHistory';
import { getRenamedCoursesLabel } from '$lib/renames/utils';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { Box, Card, CardContent, CardHeader, IconButton, Skeleton, Tooltip, Typography } from '@mui/material';
import type { AATerm } from '@packages/antalmanac-types';
import type { WebsocSectionType } from '@packages/anteater-api/types';
import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from 'react';

const EnrollmentHistoryPopoverChart = dynamic(() => import('./EnrollmentHistoryPopoverChart'), {
    ssr: false,
    loading: () => <Skeleton variant="rectangular" animation="wave" height="100%" width="100%" />,
});

interface EnrollmentHistoryPopoverProps {
    sectionType: WebsocSectionType;
    department: string;
    courseNumber: string;
    term: AATerm;
    sectionCode: string;
}

function graphKey(enrollment: EnrollmentHistory) {
    return `${enrollment.sectionCode} ${enrollment.term.shortName}`;
}

export function EnrollmentHistoryPopover({
    sectionType,
    department,
    courseNumber,
    term,
    sectionCode,
}: EnrollmentHistoryPopoverProps) {
    const predecessorLabel = getRenamedCoursesLabel(department, courseNumber);

    const { data: enrollmentHistory, isLoading: loading } = trpcReact.enrollHist.get.useQuery(
        { department, courseNumber, sectionType },
        { select: parseAndSortEnrollmentHistory }
    );
    const [selectedGraphKey, setSelectedGraphKey] = useState<string>();

    const isMobile = useIsMobile();

    const width = isMobile ? 280 : 400;
    const height = isMobile ? 180 : 240;

    const activeGraphIndex = useMemo(() => {
        if (!enrollmentHistory?.length) {
            return 0;
        }

        if (selectedGraphKey) {
            const selectedIndex = enrollmentHistory.findIndex(
                (enrollment) => graphKey(enrollment) === selectedGraphKey
            );

            if (selectedIndex >= 0) {
                return selectedIndex;
            }
        }
        const matchIndex = enrollmentHistory.findIndex(
            (e) => e.term.shortName === term.shortName && e.sectionCode === sectionCode
        );
        return matchIndex >= 0 ? matchIndex : enrollmentHistory.length - 1;
    }, [enrollmentHistory, sectionCode, selectedGraphKey, term]);

    const title = `${department} ${courseNumber}`;
    const currEnrollmentHistory = enrollmentHistory?.at(activeGraphIndex);
    const subheader =
        currEnrollmentHistory != null
            ? `${currEnrollmentHistory.term.shortName} | ${sectionType} | ${currEnrollmentHistory.sectionCode}`
            : null;

    const handleBack = useCallback(() => {
        if (!enrollmentHistory?.length || activeGraphIndex === 0) {
            return;
        }
        setSelectedGraphKey(graphKey(enrollmentHistory[activeGraphIndex - 1]));
    }, [activeGraphIndex, enrollmentHistory]);

    const handleForward = useCallback(() => {
        if (!enrollmentHistory?.length || activeGraphIndex === enrollmentHistory.length - 1) {
            return;
        }
        setSelectedGraphKey(graphKey(enrollmentHistory[activeGraphIndex + 1]));
    }, [activeGraphIndex, enrollmentHistory]);

    const historyCount = enrollmentHistory?.length ?? 0;
    const navDisabled = loading || historyCount === 0;

    const headerAction = (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Older Graph">
                <span>
                    <IconButton size="small" onClick={handleBack} disabled={navDisabled || activeGraphIndex === 0}>
                        <ArrowBack />
                    </IconButton>
                </span>
            </Tooltip>
            <Tooltip title="Newer Graph">
                <span>
                    <IconButton
                        size="small"
                        onClick={handleForward}
                        disabled={navDisabled || activeGraphIndex >= historyCount - 1}
                    >
                        <ArrowForward />
                    </IconButton>
                </span>
            </Tooltip>
        </Box>
    );

    return (
        <Card>
            <CardHeader
                title={title}
                subheader={<SectionTablePopoverSubheader subheader={subheader} predecessorLabel={predecessorLabel} />}
                action={headerAction}
                slotProps={{
                    title: { sx: { fontWeight: 500 }, variant: 'subtitle1' },
                    action: { sx: { alignSelf: 'flex-start', margin: 0 } },
                }}
            />

            <CardContent sx={{ display: 'flex', flexDirection: 'column', minWidth: width, paddingTop: 0 }}>
                {loading ? (
                    <Box sx={{ width, height }}>
                        <Skeleton variant="rectangular" animation="wave" height="100%" width="100%" />
                    </Box>
                ) : enrollmentHistory == null || !enrollmentHistory.length ? (
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
                            No past enrollment data found for this course
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', height, width }}>
                        <EnrollmentHistoryPopoverChart days={enrollmentHistory[activeGraphIndex].days} />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
