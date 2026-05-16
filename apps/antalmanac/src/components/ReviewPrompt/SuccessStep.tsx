'use client';

import analyticsEnum from '$lib/analytics/analytics';
import { useReviewPromptStore } from '$stores/ReviewPromptStore';
import { CheckCircleOutline, Close } from '@mui/icons-material';
import { Box, Button, CardActions, CardContent, CardHeader, IconButton, Typography } from '@mui/material';

export function SuccessStep() {
    const courseId = useReviewPromptStore((s) => s.candidate?.courseId ?? '');
    const professorId = useReviewPromptStore((s) => s.candidate?.professorId ?? '');
    const eligibleCandidates = useReviewPromptStore((s) => s.eligibleCandidates);
    const eligibleIndex = useReviewPromptStore((s) => s.eligibleIndex);
    const advanceToNext = useReviewPromptStore((s) => s.advanceToNext);
    const finishReviewing = useReviewPromptStore((s) => s.finishReviewing);

    const hasMore = eligibleIndex + 1 < eligibleCandidates.length;

    return (
        <>
            <CardHeader
                title={
                    <Typography variant="subtitle1" fontWeight={600}>
                        Review submitted!
                    </Typography>
                }
                action={
                    <IconButton
                        size="small"
                        onClick={() => finishReviewing(analyticsEnum.review.actions.REVIEW_SUCCESS_DISMISSED)}
                        aria-label="close"
                    >
                        <Close fontSize="small" />
                    </IconButton>
                }
            />

            <CardContent sx={{ paddingTop: 0 }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircleOutline color="success" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                        Thanks for reviewing{' '}
                        <Box component="span" fontWeight={600} color="text.primary">
                            {courseId}
                        </Box>{' '}
                        with {professorId}.
                    </Typography>
                </Box>
            </CardContent>

            <CardActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
                {hasMore && (
                    <Button size="small" color="inherit" onClick={advanceToNext}>
                        Review another course
                    </Button>
                )}

                <Button size="small" variant="contained" onClick={() => finishReviewing()}>
                    Done
                </Button>
            </CardActions>
        </>
    );
}
