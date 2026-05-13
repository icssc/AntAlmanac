'use client';

import { trpcReact } from '$lib/api/trpc';
import { useReviewPromptStore } from '$stores/ReviewPromptStore';
import { Close } from '@mui/icons-material';
import { Box, Button, CardActions, CardContent, CardHeader, IconButton, Typography } from '@mui/material';

export function EnrollmentConfirmStep() {
    const courseId = useReviewPromptStore((s) => s.candidate?.courseId ?? '');
    const courseTitle = useReviewPromptStore((s) => s.candidate?.courseTitle ?? '');
    const professorId = useReviewPromptStore((s) => s.candidate?.professorId ?? '');
    const term = useReviewPromptStore((s) => s.candidate?.term ?? null);
    const confirm = useReviewPromptStore((s) => s.confirm);
    const dismiss = useReviewPromptStore((s) => s.dismiss);

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
                    I did not
                </Button>

                <Button size="small" variant="contained" onClick={confirm}>
                    Yes, continue!
                </Button>
            </CardActions>
        </>
    );
}
