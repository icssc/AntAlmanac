import { Stack } from '@mui/material';

import { AboutButton } from '$components/buttons/AboutButton';
import { DonateButton } from '$components/buttons/DonateButton';
import { FeedbackButton } from '$components/buttons/FeedbackButton';
import { PatchNotesButton } from '$components/buttons/PatchNotesButton';
import { TutorialButton } from '$components/buttons/TutorialButton';

export function About() {
    return (
        <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <DonateButton />
            <AboutButton />
            <FeedbackButton />
            <PatchNotesButton />
            <TutorialButton />
        </Stack>
    );
}
