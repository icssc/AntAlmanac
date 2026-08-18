'use client';

import { trpcReact } from '$lib/api/trpc';
import { useReviewPromptStore } from '$stores/ReviewPromptStore';
import { Close } from '@mui/icons-material';
import { Box, Button, CardActions, CardContent, CardHeader, IconButton, Typography } from '@mui/material';
import { useShallow } from 'zustand/react/shallow';

export function EnrollmentConfirmStep() {
    const { candidate, confirm, dismiss } = useReviewPromptStore(
        useShallow((s) => ({ candidate: s.candidate, confirm: s.confirm, dismiss: s.dismiss }))
    );
    const courseId = candidate?.courseId ?? '';
    const courseTitle = candidate?.courseTitle ?? '';
    const professorId = candidate?.professorId ?? '';
    const term = candidate?.term ?? null;

    const { mutate: dismissReview } = trpcReact.review.dismissReview.useMutation();

    const handleDismiss = () => {
        const candidate = dismiss();
        if (candidate) {
            dismissReview({
                professorId: candidate.professorId,
                courseId: candidate.courseId,
                termShortName: candidate.term.shortName,
            });
        }
    };

    return (
        <>
            <CardHeader
                title={
                    <Typography variant="subtitle1" fontWeight={600}>
                        Quick question
                    </Typography>
                }
                action={
                    <IconButton size="small" onClick={handleDismiss} aria-label="dismiss">
                        <Close fontSize="small" />
                    </IconButton>
                }
            />

            <CardContent sx={{ paddingTop: 0 }}>
                <Typography variant="body1" color="text.secondary">
                    Did you take{' '}
                    <Box component="span" fontWeight={600} color="text.primary">
                        {courseId}
                    </Box>{' '}
                    {courseTitle && <>({courseTitle}) </>}
                    in{' '}
                    <Box component="span" fontWeight={600} color="text.primary">
                        {term?.shortName}
                    </Box>{' '}
                    with{' '}
                    <Box component="span" fontWeight={600} color="text.primary">
                        {professorId}
                    </Box>
                    ?
                </Typography>
            </CardContent>

            <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button size="small" color="inherit" onClick={handleDismiss}>
                    No, I did not
                </Button>

                <Button size="small" variant="contained" onClick={confirm}>
                    Yes, continue
                </Button>
            </CardActions>
        </>
    );
}
