'use client';

import { REVIEW_TAGS, type ReviewTag } from '$stores/ReviewPromptStore';
import CloseIcon from '@mui/icons-material/Close';
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

export interface ReviewStepProps {
    courseId: string;
    professorId: string;
    rating: number;
    selectedTags: ReviewTag[];
    onRatingChange: (rating: number) => void;
    onTagToggle: (tag: ReviewTag) => void;
    onSubmit: () => void;
    onDismiss: () => void;
}

function ratingLabel(rating: number): string {
    switch (rating) {
        case 1:
            return 'Poor';
        case 2:
            return 'Fair';
        case 3:
            return 'Average';
        case 4:
            return 'Good';
        case 5:
            return 'Great';
        default:
            return '';
    }
}

export function ReviewStep({
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
