'use client';

import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, CardActions, CardContent, CardHeader, IconButton, Typography } from '@mui/material';

export interface EnrollmentConfirmStepProps {
    courseId: string;
    courseTitle: string;
    professorId: string;
    term: string;
    onConfirm: () => void;
    onDismiss: () => void;
}

export function EnrollmentConfirmStep({
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
                    <Typography variant="subtitle1" fontWeight={600}>
                        Quick question
                    </Typography>
                }
                action={
                    <IconButton size="small" onClick={onDismiss} aria-label="dismiss">
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
                <Button size="small" color="inherit" onClick={onDismiss}>
                    I did not
                </Button>

                <Button size="small" variant="contained" onClick={onConfirm}>
                    Yes!
                </Button>
            </CardActions>
        </>
    );
}
