'use client';

import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { trpcReact } from '$lib/api/trpc';
import { postHog } from '$providers/PostHog';
import { REVIEW_TAGS } from '$stores/ReviewPromptStore';
import { useReviewPromptStore } from '$stores/ReviewPromptStore';
import { openSnackbar } from '$stores/SnackbarStore';
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
    TextField,
    Typography,
} from '@mui/material';
import { useShallow } from 'zustand/react/shallow';

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

function difficultyLabel(difficulty: number): string {
    switch (difficulty) {
        case 1:
            return 'Very Easy';
        case 2:
            return 'Easy';
        case 3:
            return 'Average';
        case 4:
            return 'Difficult';
        case 5:
            return 'Very Difficult';
        default:
            return '';
    }
}

export function ReviewStep() {
    const {
        candidate,
        rating,
        difficulty,
        selectedTags,
        setRating,
        setDifficulty,
        textReview,
        setTextReview,
        toggleTag,
        dismiss,
        resetReview,
    } = useReviewPromptStore(
        useShallow((s) => ({
            candidate: s.candidate,
            rating: s.rating,
            difficulty: s.difficulty,
            selectedTags: s.selectedTags,
            setRating: s.setRating,
            setDifficulty: s.setDifficulty,
            textReview: s.textReview,
            setTextReview: s.setTextReview,
            toggleTag: s.toggleTag,
            dismiss: s.dismiss,
            resetReview: s.resetReview,
        }))
    );
    const courseId = candidate?.courseId ?? '';
    const professorId = candidate?.professorId ?? '';

    const { mutate: dismissReview } = trpcReact.review.dismissReview.useMutation();

    const { mutate: submitReview, isPending: isSubmitting } = trpcReact.review.submitReview.useMutation({
        onSuccess: () => {
            if (!candidate) {
                return;
            }

            logAnalytics(postHog, {
                category: analyticsEnum.review,
                action: analyticsEnum.review.actions.SUBMITTED,
                customProps: {
                    courseId: candidate.courseId,
                    professorId: candidate.professorId,
                    term: candidate.term.shortName,
                    rating,
                    difficulty,
                    tags: selectedTags,
                },
            });
            resetReview();
            openSnackbar('success', 'Review submitted — thanks for helping other Anteaters!');
        },
        onError: () => {
            openSnackbar('error', 'Failed to submit review. Please try again.');
        },
    });

    const handleDismiss = () => {
        if (isSubmitting) {
            return;
        }

        const dismissedCandidate = dismiss();
        if (dismissedCandidate) {
            dismissReview({
                professorId: dismissedCandidate.professorId,
                courseId: dismissedCandidate.courseId,
                termShortName: dismissedCandidate.term.shortName,
            });
        }
    };

    const handleSubmit = () => {
        if (!candidate || rating === 0 || difficulty === 0) {
            return;
        }

        submitReview({
            professorId: candidate.professorId,
            courseId: candidate.courseId,
            termShortName: candidate.term.shortName,
            rating,
            difficulty,
            tags: selectedTags,
            content: textReview.trim() || undefined,
        });
    };

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
                    <IconButton size="small" onClick={handleDismiss} aria-label="dismiss">
                        <Close fontSize="small" />
                    </IconButton>
                }
            />

            <CardContent sx={{ paddingTop: 0 }}>
                <Stack spacing={2}>
                    <Box display="flex" flexDirection="row" gap={8}>
                        <Box display="flex" flexDirection="column" gap={0.5}>
                            <Typography color="text.secondary">Overall Quality</Typography>
                            <Box display="flex" flexDirection="column" gap={1}>
                                <Rating value={rating} onChange={(_e, value) => setRating(value ?? 0)} size="large" />
                                <Typography variant="caption" color="text.secondary">
                                    {ratingLabel(rating)}
                                </Typography>
                            </Box>
                        </Box>

                        <Box display="flex" flexDirection="column" gap={0.5}>
                            <Typography color="text.secondary">Difficulty (low → high)</Typography>
                            <Box display="flex" flexDirection="column" gap={1}>
                                <Rating
                                    value={difficulty}
                                    onChange={(_e, value) => setDifficulty(value ?? 0)}
                                    size="large"
                                />
                                <Typography variant="caption" color="text.secondary">
                                    {difficultyLabel(difficulty)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <TextField
                        color="secondary"
                        label="Write a review (optional)"
                        multiline
                        minRows={1}
                        maxRows={5}
                        fullWidth
                        value={textReview}
                        onChange={(e) => setTextReview(e.target.value)}
                        slotProps={{
                            htmlInput: { maxLength: 500 },
                            formHelperText: {
                                sx: { textAlign: 'right', mx: 0, color: 'text.secondary' },
                            },
                        }}
                        helperText={`${textReview.length}/500`}
                    />

                    <Box display="flex" flexDirection="column" gap={0.5}>
                        <Typography color="text.secondary">Tags</Typography>
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
                    </Box>
                </Stack>
            </CardContent>

            <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button size="small" color="inherit" onClick={handleDismiss}>
                    Skip
                </Button>

                <Button
                    size="small"
                    variant="contained"
                    disabled={rating === 0 || difficulty === 0 || isSubmitting}
                    loading={isSubmitting}
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            </CardActions>
        </>
    );
}
