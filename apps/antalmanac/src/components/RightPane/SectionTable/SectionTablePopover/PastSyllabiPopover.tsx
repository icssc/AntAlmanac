import { useIsMobile } from '$hooks/useIsMobile';
import { WebSOC } from '$lib/websoc';
import { Box, Card, CardContent, CardHeader, Link as MuiLink, Skeleton, Stack, Typography } from '@mui/material';
import type { WebsocSyllabiResponse } from '@packages/antalmanac-types';
import { useEffect, useState } from 'react';

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

    const title = `${deptCode} ${courseNumber}`;
    const minWidth = isMobile ? 250 : 400;

    useEffect(() => {
        setLoading(true);

        WebSOC.getSyllabi({ courseId })
            .catch((e) => {
                console.error(e);
                return undefined;
            })
            .then((result) => {
                console.log(result);
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
                slotProps={{
                    title: { sx: { fontWeight: 500 }, variant: 'subtitle1' },
                }}
            />

            <CardContent sx={{ minWidth, paddingTop: 0 }}>
                {loading ? (
                    <Skeleton variant="rectangular" animation="wave" height={120} width="100%" />
                ) : syllabi.length === 0 ? (
                    <Typography variant="body1" color="text.secondary">
                        No syllabi found for this course.
                    </Typography>
                ) : (
                    <Stack spacing={1.5} sx={{ maxHeight: 320, overflow: 'auto' }}>
                        {syllabi.map((entry, index) => (
                            <Box key={`${entry.year}-${entry.quarter}-${entry.url}-${index}`}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    {entry.year} {entry.quarter}
                                    {entry.instructorNames.length > 0 ? ` · ${entry.instructorNames.join(', ')}` : ''}
                                </Typography>
                                <MuiLink href={entry.url} target="_blank" rel="noopener noreferrer" variant="body2">
                                    Open syllabus
                                </MuiLink>
                            </Box>
                        ))}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
}
