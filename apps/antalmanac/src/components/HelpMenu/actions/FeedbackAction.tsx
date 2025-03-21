import { Feedback as FeedbackIcon } from '@mui/icons-material';
import { useCallback } from 'react';

import { HelpMenuAction } from '$components/HelpMenu/HelpMenu';
import Feedback from '$routes/Feedback';

export function FeedbackAction(): HelpMenuAction {
    const handleClick = useCallback(() => Feedback(), []);

    return { icon: <FeedbackIcon />, name: 'Share Feedback', onClick: handleClick };
}
