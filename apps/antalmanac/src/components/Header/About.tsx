import { Stack } from '@mui/material';

import { AboutButton } from '$components/buttons/AboutButton';
import { DonateButton } from '$components/buttons/DonateButton';
import { FeedbackButton } from '$components/buttons/FeedbackButton';
import { PatchNotesButton } from '$components/buttons/PatchNotesButton';
import { TutorialButton } from '$components/buttons/TutorialButton';

interface AboutProps {
    onMenuClose?: () => void;
}

export function About({ onMenuClose }: AboutProps) {
    return (
        <>
            <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap' }}>
                <FeedbackButton />
                <AboutButton />
                <DonateButton />
            </Stack>
            <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap' }}>
                <PatchNotesButton />
                <TutorialButton onMenuClose={onMenuClose} />
            </Stack>
        </>
    );
}
