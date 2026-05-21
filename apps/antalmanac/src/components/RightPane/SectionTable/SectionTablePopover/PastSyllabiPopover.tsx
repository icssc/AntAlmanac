import { useIsMobile } from '$hooks/useIsMobile';
import { trpcReact } from '$lib/api/trpc';
import { getPredecessorLabel } from '$lib/courseRenames';
import { OpenInNew } from '@mui/icons-material';
import {
    Card,
    CardContent,
    CardHeader,
    List,
    ListItemButton,
    ListItemText,
    ListSubheader,
    Skeleton,
    Typography,
} from '@mui/material';
import Link from 'next/link';
import { useMemo } from 'react';

interface PastSyllabiPopoverProps {
    deptCode: string;
    courseNumber: string;
    courseId: string;
}

export function PastSyllabiPopover(props: PastSyllabiPopoverProps) {
    const isMobile = useIsMobile();
    const { deptCode, courseNumber, courseId } = props;
    const predecessorLabel = getPredecessorLabel(deptCode, courseNumber);

    const { data: syllabi = [], isLoading: loading } = trpcReact.websoc.getSyllabi.useQuery({ courseId });

    const width = isMobile ? 250 : 400;
    const height = isMobile ? 150 : 200;

    const syllabiByTerm = useMemo(() => {
        return syllabi.reduce(
            (acc, entry) => {
                const term = `${entry.year} ${entry.quarter}`;

                acc[term] ??= [];
                acc[term].push(entry);

                return acc;
            },
            {} as Record<string, (typeof syllabi)[number][]>
        );
    }, [syllabi]);

    const title = `${deptCode} ${courseNumber}`;
    const subheader = loading
        ? null
        : `${syllabi.length} ${syllabi.length === 1 ? 'syllabus' : 'syllabi'} across ${Object.keys(syllabiByTerm).length} ${Object.keys(syllabiByTerm).length === 1 ? 'term' : 'terms'}`;

    return (
        <Card>
            <CardHeader
                title={title}
                subheader={
                    <>
                        {subheader ?? (!predecessorLabel && <>&nbsp;</>)}
                        {subheader && predecessorLabel && <br />}
                        {predecessorLabel}
                    </>
                }
                slotProps={{
                    title: { sx: { fontWeight: 500 }, variant: 'subtitle1' },
                }}
            />

            <CardContent sx={{ minWidth: width, paddingTop: 0 }}>
                {loading ? (
                    <Skeleton variant="rectangular" animation="wave" height="150px" width="100%" />
                ) : syllabi.length === 0 ? (
                    <Typography variant="body1" color="text.secondary">
                        No syllabi found for this course.
                    </Typography>
                ) : (
                    <List disablePadding sx={{ maxHeight: height, overflow: 'auto' }}>
                        {Object.entries(syllabiByTerm).map(([term, entries]) => (
                            <ListSubheader key={term} disableGutters disableSticky>
                                <Typography variant="body1" color="text.primary">
                                    {term}
                                </Typography>
                                {entries.map((entry) => (
                                    <ListItemButton
                                        LinkComponent={Link}
                                        href={entry.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        key={entry.url}
                                    >
                                        <ListItemText primary={entry.instructorNames.at(0) ?? 'N/A'} />
                                        <OpenInNew />
                                    </ListItemButton>
                                ))}
                            </ListSubheader>
                        ))}
                    </List>
                )}
            </CardContent>
        </Card>
    );
}
