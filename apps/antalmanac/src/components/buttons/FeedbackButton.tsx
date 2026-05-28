import { FEEDBACK_LINK } from '$src/globals';
import { Assignment } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';

export const FeedbackButton = () => {
    return (
        <Tooltip title="Give Us Feedback!">
            <Button
                color="inherit"
                startIcon={<Assignment />}
                size="large"
                variant="text"
                component={Link}
                href={FEEDBACK_LINK}
                target="_blank"
                rel="noopener noreferrer"
            >
                Feedback
            </Button>
        </Tooltip>
    );
};
