'use client';

import { REVIEW_TAGS } from '$stores/ReviewPromptStore';
import { useReviewPromptStore } from '$stores/ReviewPromptStore';
import { Close } from '@mui/icons-material';
import {
    Box,
    Button,
    CardActions,
    CardContent,
    CardHeader,
    Chip,
    IconButton,
    Rating,
    Stack,
    Typography,
} from '@mui/material';

function ratingLabel(rating: number): string {
    // Aligned with RMP
    switch (rating) {
        case 1:
            return 'Awful';
        case 2:
            return 'OK';
        case 3:
            return 'Good';
        case 4:
            return 'Great';
        case 5:
            return 'Awesome';
        default:
            return '';
    }
}

export function ReviewStep() {
    const courseId = useReviewPromptStore((s) => s.candidate?.courseId ?? '');
    const professorId = useReviewPromptStore((s) => s.candidate?.professorId ?? '');
    const rating = useReviewPromptStore((s) => s.rating);
    const selectedTags = useReviewPromptStore((s) => s.selectedTags);
    const setRating = useReviewPromptStore((s) => s.setRating);
    const toggleTag = useReviewPromptStore((s) => s.toggleTag);
    const submitReview = useReviewPromptStore((s) => s.submitReview);
    const dismiss = useReviewPromptStore((s) => s.dismiss);

    return (
        <>
            <CardHeader
                title={
                    <Typography variant="subtitle1" fontWeight={600}>
                        How was {courseId}?
                    </Typography>
                }
                subheader={<Typography color="text.secondary">with {professorId}</Typography>}
                action={
                    <IconButton size="small" onClick={dismiss} aria-label="dismiss">
                        <Close fontSize="small" />
                    </IconButton>
                }
            />

            <CardContent sx={{ paddingTop: 0 }}>
                <Stack spacing={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Rating value={rating} onChange={(_e, value) => setRating(value ?? 0)} size="large" />
                        {rating > 0 && (
                            <Typography variant="caption" color="text.secondary">
                                {ratingLabel(rating)}
                            </Typography>
                        )}
                    </Box>

                    <Box display="flex" flexWrap="wrap" gap={0.75}>
                        {REVIEW_TAGS.map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                onClick={() => toggleTag(tag)}
                                color={selectedTags.includes(tag) ? 'primary' : 'default'}
                                variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                                sx={{ cursor: 'pointer' }}
                            />
                        ))}
                    </Box>
                </Stack>
            </CardContent>

            <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button size="small" color="inherit" onClick={dismiss}>
                    Skip
                </Button>

                <Button size="small" variant="contained" disabled={rating === 0} onClick={submitReview}>
                    Submit
                </Button>
            </CardActions>
        </>
    );
}
