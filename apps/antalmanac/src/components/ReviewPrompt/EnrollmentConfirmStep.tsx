'use client';

import { useReviewPromptStore } from '$stores/ReviewPromptStore';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, CardActions, CardContent, CardHeader, IconButton, Typography } from '@mui/material';

export function EnrollmentConfirmStep() {
    const courseId = useReviewPromptStore((s) => s.candidate?.courseId ?? '');
    const courseTitle = useReviewPromptStore((s) => s.candidate?.courseTitle ?? '');
    const professorId = useReviewPromptStore((s) => s.candidate?.professorId ?? '');
    const term = useReviewPromptStore((s) => s.candidate?.term ?? '');
    const confirm = useReviewPromptStore((s) => s.confirm);
    const dismiss = useReviewPromptStore((s) => s.dismiss);

    return (
        <>
            <CardHeader
                title={
                    <Typography variant="subtitle1" fontWeight={600}>
                        Quick question
                    </Typography>
                }
                action={
                    <IconButton size="small" onClick={dismiss} aria-label="dismiss">
                        <CloseIcon fontSize="small" />
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
                        {term}
                    </Box>{' '}
                    with{' '}
                    <Box component="span" fontWeight={600} color="text.primary">
                        {professorId}
                    </Box>
                    ?
                </Typography>
            </CardContent>

            <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button size="small" color="inherit" onClick={dismiss}>
                    I did not
                </Button>

                <Button size="small" variant="contained" onClick={confirm}>
                    Yes!
                </Button>
            </CardActions>
        </>
    );
}
