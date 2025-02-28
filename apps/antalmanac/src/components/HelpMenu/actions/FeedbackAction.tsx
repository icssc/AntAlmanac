import { Feedback as FeedbackIcon } from '@mui/icons-material';

import Feedback from '$routes/Feedback';

export function FeedbackAction() {
    return { icon: <FeedbackIcon />, name: 'Share Feedback', onClick: Feedback };
}
