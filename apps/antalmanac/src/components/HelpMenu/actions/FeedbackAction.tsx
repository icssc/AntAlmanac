import { Feedback as FeedbackIcon } from '@mui/icons-material';
import { useCallback } from 'react';

import Feedback from '$routes/Feedback';

export function FeedbackAction() {
    const clickFeedback = useCallback(() => Feedback(), []);

    return { icon: <FeedbackIcon />, name: 'Share Feedback', onClick: clickFeedback };
}
