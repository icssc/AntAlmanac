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
import { useEffect, useMemo, useState } from 'react';

export interface PastSyllabiPopoverProps {
    deptCode: string;
    courseNumber: string;
    courseId: string;
}

export function PastSyllabiPopover(props: PastSyllabiPopoverProps) {
    const isMobile = useIsMobile();
    const { deptCode, courseNumber, courseId } = props;

    const [loading, setLoading] = useState(true);
    const [syllabi, setSyllabi] = useState<WebsocSyllabiResponse>([]);

    const width = isMobile ? 250 : 400;
    const height = isMobile ? 150 : 200;

    const syllabiByTerm = useMemo(() => {
        return syllabi.reduce(
            (acc, entry) => {
                const term = `${entry.year} ${entry.quarter}`;

                if (!acc[term]) {
                    acc[term] = [];
                }

                acc[term].push(entry);
                return acc;
            },
            {} as Record<string, WebsocSyllabiResponse[number][]>
        );
    }, [syllabi]);

    const title = `${deptCode} ${courseNumber}`;
    const subheader = loading ? (
        <>&nbsp;</>
    ) : (
        `${syllabi.length} syllabi across ${Object.keys(syllabiByTerm).length} terms`
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

            <CardContent sx={{ minWidth: width, height: height, paddingTop: 0 }}>
                {loading ? (
                    <Skeleton variant="rectangular" animation="wave" height="100%" width="100%" />
                ) : syllabi.length === 0 ? (
                    <Typography variant="body1" color="text.secondary">
                        No syllabi found for this course.
                    </Typography>
                ) : (
                    <List disablePadding sx={{ maxHeight: height, overflow: 'auto', paddingBottom: 3 }}>
                        {Object.entries(syllabiByTerm).map(([term, entries]) => (
                            <ListSubheader key={term} disableGutters>
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
                                        <ListItemText primary={entry.instructorNames.at(0)} />
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
