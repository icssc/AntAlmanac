import { Stack } from '@mui/material';

import { AboutButton } from '$components/buttons/AboutButton';
import { DonateButton } from '$components/buttons/DonateButton';
import { FeedbackButton } from '$components/buttons/FeedbackButton';

export function About() {
    return (
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <DonateButton />
            <AboutButton />
            <FeedbackButton />
        </Stack>
    );
}
