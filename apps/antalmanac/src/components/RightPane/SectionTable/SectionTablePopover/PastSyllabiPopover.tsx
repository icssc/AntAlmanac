import { useIsMobile } from '$hooks/useIsMobile';
import { WebSOC } from '$lib/websoc';
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
import type { WebsocSyllabiResponse } from '@packages/antalmanac-types';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

function normalizeInstructorName(name: string) {
    return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export interface PastSyllabiPopoverProps {
    deptCode: string;
    courseNumber: string;
    courseId: string;
    /**
     * When set (e.g. from the enrollment history graph), scroll to this term + instructor row first.
     * Format matches list grouping: "YYYY Quarter" (e.g. "2024 Fall").
     */
    anchorYearQuarter?: string;
    /** Primary instructor name to match the first entry in `instructorNames` when disambiguating. */
    anchorPrimaryInstructor?: string;
}

export function PastSyllabiPopover(props: PastSyllabiPopoverProps) {
    const isMobile = useIsMobile();
    const { deptCode, courseNumber, courseId, anchorYearQuarter, anchorPrimaryInstructor } = props;

    const [loading, setLoading] = useState(true);
    const [syllabi, setSyllabi] = useState<WebsocSyllabiResponse>([]);
    const anchorItemRef = useRef<HTMLDivElement>(null);

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
            {} as Record<string, WebsocSyllabiResponse[number][]>
        );
    }, [syllabi]);

    const defaultAnchorEntry = useMemo(() => {
        if (syllabi.length === 0) {
            return undefined;
        }

        const termFilter = anchorYearQuarter?.trim();
        const profNorm = anchorPrimaryInstructor?.trim()
            ? normalizeInstructorName(anchorPrimaryInstructor)
            : undefined;

        if (termFilter && profNorm) {
            const match = syllabi.find((entry) => {
                const term = `${entry.year} ${entry.quarter}`;
                if (term !== termFilter) {
                    return false;
                }
                const primary = entry.instructorNames.at(0) ?? '';
                return normalizeInstructorName(primary) === profNorm;
            });
            if (match) {
                return match;
            }
        }

        if (termFilter) {
            const inTerm = syllabi.filter((entry) => `${entry.year} ${entry.quarter}` === termFilter);
            if (inTerm.length === 1) {
                return inTerm[0];
            }
            if (inTerm.length > 1 && profNorm) {
                const profMatch = inTerm.find((entry) => {
                    const primary = entry.instructorNames.at(0) ?? '';
                    return normalizeInstructorName(primary) === profNorm;
                });
                if (profMatch) {
                    return profMatch;
                }
            }
            return inTerm[0];
        }

        return undefined;
    }, [syllabi, anchorYearQuarter, anchorPrimaryInstructor]);

    useEffect(() => {
        if (loading || defaultAnchorEntry == null) {
            return;
        }

        anchorItemRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [defaultAnchorEntry, loading, syllabi]);

    const title = `${deptCode} ${courseNumber}`;
    const subheader = loading ? (
        <>&nbsp;</>
    ) : (
        `${syllabi.length} ${syllabi.length === 1 ? 'syllabus' : 'syllabi'} across ${Object.keys(syllabiByTerm).length} ${Object.keys(syllabiByTerm).length === 1 ? 'term' : 'terms'}`
    );

    useEffect(() => {
        setLoading(true);

        WebSOC.getSyllabi({ courseId })
            .catch((e) => {
                console.error(e);
                return undefined;
            })
            .then((result) => {
                setSyllabi(result ?? []);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [courseId]);

    return (
        <Card>
            <CardHeader
                title={title}
                subheader={subheader}
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
                                {entries.map((entry) => {
                                    const isHighlighted =
                                        defaultAnchorEntry != null && entry.url === defaultAnchorEntry.url;
                                    return (
                                        <ListItemButton
                                            LinkComponent={Link}
                                            href={entry.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            key={entry.url}
                                            ref={isHighlighted ? anchorItemRef : undefined}
                                            selected={isHighlighted}
                                            sx={
                                                isHighlighted
                                                    ? {
                                                          bgcolor: 'action.selected',
                                                      }
                                                    : undefined
                                            }
                                        >
                                            <ListItemText primary={entry.instructorNames.at(0) ?? 'N/A'} />
                                            <OpenInNew />
                                        </ListItemButton>
                                    );
                                })}
                            </ListSubheader>
                        ))}
                    </List>
                )}
            </CardContent>
        </Card>
    );
}
