import { Assignment } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';

import { FEEDBACK_LINK } from '$src/globals';

const FeedbackButton = () => {
    return (
        <Tooltip title="Give Us Feedback!">
            <Button
                color="inherit"
                startIcon={<Assignment />}
                size="large"
                variant="text"
                href={FEEDBACK_LINK}
                target="_blank"
            >
                Feedback
            </Button>
        </Tooltip>
    );
};

export default FeedbackButton;
