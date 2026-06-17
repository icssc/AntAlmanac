import { Assignment } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';
import Link from 'next/link';

export const FeedbackButton = () => {
    return (
        <Tooltip title="Give Us Feedback!">
            <Button
                color="inherit"
                startIcon={<Assignment />}
                size="large"
                variant="text"
                component={Link}
                href="/feedback"
            >
                Feedback
            </Button>
        </Tooltip>
    );
};
