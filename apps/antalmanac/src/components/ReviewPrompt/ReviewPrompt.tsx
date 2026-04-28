'use client';

import { REVIEW_TAGS, type ReviewTag, useReviewPromptStore } from '$stores/ReviewPromptStore';
import { useSessionStore } from '$stores/SessionStore';
import CloseIcon from '@mui/icons-material/Close';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Chip,
    Fade,
    IconButton,
    Rating,
    Stack,
    Typography,
} from '@mui/material';
import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

const PROMPT_DELAY_MS = 15_000;

export function ReviewPrompt() {
    const { userId, sessionIsValid } = useSessionStore(
        useShallow((s) => ({ userId: s.userId, sessionIsValid: s.sessionIsValid }))
    );

    const { candidate, step, rating, selectedTags, initPrompt, confirm, dismiss, setRating, toggleTag, submitReview } =
        useReviewPromptStore();

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const promptInitialized = useRef(false);

    // Trigger candidate selection once the session is confirmed and the user
    // has had a moment to settle into the page.
    useEffect(() => {
        if (!sessionIsValid || !userId || promptInitialized.current) return;
        promptInitialized.current = true;

        timerRef.current = setTimeout(() => {
            initPrompt();
        }, PROMPT_DELAY_MS);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [sessionIsValid, userId, initPrompt]);

    if (step === 'hidden' || !candidate) return null;

    const handleSubmit = () => {
        submitReview();
    };

    return (
        <Fade in timeout={400}>
            <Card
                elevation={6}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    width: 340,
                    zIndex: 1300,
                    borderRadius: 2,
                }}
            >
                {step === 'enrollment-confirm' && (
                    <EnrollmentConfirmStep
                        courseId={candidate.courseId}
                        courseTitle={candidate.courseTitle}
                        professorId={candidate.professorId}
                        term={candidate.term}
                        onConfirm={confirm}
                        onDismiss={dismiss}
                    />
                )}

                {step === 'review' && (
                    <ReviewStep
                        courseId={candidate.courseId}
                        professorId={candidate.professorId}
                        rating={rating}
                        selectedTags={selectedTags}
                        onRatingChange={setRating}
                        onTagToggle={toggleTag}
                        onSubmit={handleSubmit}
                        onDismiss={dismiss}
                    />
                )}
            </Card>
        </Fade>
    );
}

// ─── Step 1: Confirm enrollment ───────────────────────────────────────────────

interface EnrollmentConfirmStepProps {
    courseId: string;
    courseTitle: string;
    professorId: string;
    term: string;
    onConfirm: () => void;
    onDismiss: () => void;
}

function EnrollmentConfirmStep({
    courseId,
    courseTitle,
    professorId,
    term,
    onConfirm,
    onDismiss,
}: EnrollmentConfirmStepProps) {
    return (
        <>
            <CardHeader
                title={
                    <Typography variant="subtitle2" fontWeight={600}>
                        Quick question
                    </Typography>
                }
                action={
                    <IconButton size="small" onClick={onDismiss} aria-label="dismiss">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
                sx={{ pb: 0 }}
            />
            <CardContent sx={{ pt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    Did you take{' '}
                    <Box component="span" fontWeight={600} color="text.primary">
                        {courseId}
                    </Box>{' '}
                    {courseTitle && <>({courseTitle}) </>}
                    in{' '}
                    <Box component="span" fontWeight={600} color="text.primary">
                        {term}
                    </Box>{' '}
                    with{' '}
                    <Box component="span" fontWeight={600} color="text.primary">
                        {professorId}
                    </Box>
                    ?
                </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', pt: 0, px: 2, pb: 1.5 }}>
                <Button size="small" color="inherit" onClick={onDismiss}>
                    Not really
                </Button>
                <Button size="small" variant="contained" onClick={onConfirm} disableElevation>
                    Yes!
                </Button>
            </CardActions>
        </>
    );
}

// ─── Step 2: Rating + tags ────────────────────────────────────────────────────

interface ReviewStepProps {
    courseId: string;
    professorId: string;
    rating: number;
    selectedTags: ReviewTag[];
    onRatingChange: (rating: number) => void;
    onTagToggle: (tag: ReviewTag) => void;
    onSubmit: () => void;
    onDismiss: () => void;
}

function ReviewStep({
    courseId,
    professorId,
    rating,
    selectedTags,
    onRatingChange,
    onTagToggle,
    onSubmit,
    onDismiss,
}: ReviewStepProps) {
    return (
        <>
            <CardHeader
                title={
                    <Typography variant="subtitle2" fontWeight={600}>
                        How was {courseId}?
                    </Typography>
                }
                subheader={
                    <Typography variant="caption" color="text.secondary">
                        with {professorId}
                    </Typography>
                }
                action={
                    <IconButton size="small" onClick={onDismiss} aria-label="dismiss">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
                sx={{ pb: 0 }}
            />
            <CardContent sx={{ pt: 1.5 }}>
                <Stack spacing={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Rating value={rating} onChange={(_e, value) => onRatingChange(value ?? 0)} size="large" />
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
                                onClick={() => onTagToggle(tag)}
                                color={selectedTags.includes(tag) ? 'primary' : 'default'}
                                variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                                sx={{ cursor: 'pointer' }}
                            />
                        ))}
                    </Box>
                </Stack>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', pt: 0, px: 2, pb: 1.5 }}>
                <Button size="small" color="inherit" onClick={onDismiss}>
                    Skip
                </Button>
                <Button size="small" variant="contained" disabled={rating === 0} onClick={onSubmit} disableElevation>
                    Submit
                </Button>
            </CardActions>
        </>
    );
}

function ratingLabel(rating: number): string {
    switch (rating) {
        case 1:
            return 'Poor';
        case 2:
            return 'Fair';
        case 3:
            return 'Good';
        case 4:
            return 'Very good';
        case 5:
            return 'Excellent';
        default:
            return '';
    }
}
