import { Stack } from '@mui/material';

import AboutButton from '$components/buttons/About';
import DonateButton from '$components/buttons/Donate';
import FeedbackButton from '$components/buttons/Feedback';

export function About() {
    return (
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <DonateButton />
            <AboutButton />
            <FeedbackButton />
        </Stack>
    );
}
