import { SectionTablePopoverSubheader } from '$components/RightPane/SectionTable/SectionTablePopover/SectionTablePopoverSubheader';
import { useIsMobile } from '$hooks/useIsMobile';
import { trpcReact } from '$lib/api/trpc';
import { getRenamedCoursesLabel } from '$lib/renames/utils';
import { OpenInNew } from '@mui/icons-material';
import { Card, CardContent, CardHeader, List, ListItem, ListItemButton, Skeleton, Typography } from '@mui/material';
import Link from 'next/link';

interface PastSyllabiPopoverProps {
    deptCode: string;
    courseNumber: string;
}

export function PastSyllabiPopover(props: PastSyllabiPopoverProps) {
    const isMobile = useIsMobile();
    const { deptCode, courseNumber } = props;
    const predecessorLabel = getRenamedCoursesLabel(deptCode, courseNumber);

    const { data: syllabi = [], isLoading: loading } = trpcReact.websoc.getSyllabi.useQuery({
        department: deptCode,
        courseNumber,
    });

    const width = isMobile ? 250 : 400;
    const height = isMobile ? 150 : 200;

    const termCount = new Set(syllabi.map((syllabus) => `${syllabus.year} ${syllabus.quarter}`)).size;

    const title = `${deptCode} ${courseNumber}`;
    const subheader = loading
        ? null
        : `${syllabi.length} ${syllabi.length === 1 ? 'syllabus' : 'syllabi'} across ${termCount} ${termCount === 1 ? 'term' : 'terms'}`;

    return (
        <Card>
            <CardHeader
                title={title}
                subheader={<SectionTablePopoverSubheader subheader={subheader} predecessorLabel={predecessorLabel} />}
                slotProps={{
                    title: { sx: { fontWeight: 500 }, variant: 'subtitle1' },
                }}
            />

            <CardContent sx={{ width, paddingTop: 0 }}>
                {loading ? (
                    <Skeleton variant="rectangular" animation="wave" height="150px" width="100%" />
                ) : syllabi.length === 0 ? (
                    <Typography variant="body1" sx={{ color: (theme) => theme.vars.palette.text.secondary }}>
                        No syllabi found for this course.
                    </Typography>
                ) : (
                    <List
                        dense
                        disablePadding
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'max-content minmax(0, 1fr) auto',
                            columnGap: 1.5,
                            maxHeight: height,
                            overflow: 'auto',
                        }}
                    >
                        {syllabi.map((syllabus) => {
                            const instructors = syllabus.instructorNames.join(', ') || 'Instructor not listed';

                            return (
                                <ListItem
                                    key={syllabus.url}
                                    disablePadding
                                    sx={{
                                        display: 'grid',
                                        gridColumn: '1 / -1',
                                        gridTemplateColumns: 'subgrid',
                                    }}
                                >
                                    <ListItemButton
                                        LinkComponent={Link}
                                        href={syllabus.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                            display: 'grid',
                                            gridColumn: '1 / -1',
                                            gridTemplateColumns: 'subgrid',
                                            alignItems: 'center',
                                            borderRadius: 1,
                                            paddingX: 1,
                                        }}
                                    >
                                        <Typography variant="body2" noWrap>
                                            {syllabus.year} {syllabus.quarter}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            noWrap
                                            title={instructors}
                                            sx={{ color: (theme) => theme.vars.palette.text.secondary }}
                                        >
                                            {instructors}
                                        </Typography>

                                        <OpenInNew
                                            fontSize="small"
                                            sx={{ color: (theme) => theme.vars.palette.text.secondary }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                )}
            </CardContent>
        </Card>
    );
}
