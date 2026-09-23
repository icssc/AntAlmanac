import { FeedbackButton } from '$components/buttons/FeedbackButton';
import { GitHubButton } from '$components/buttons/GitHubButton';
import { ProjectsButton } from '$components/buttons/ProjectsButton';
import { Stack } from '@mui/material';

export const Footer = () => {
    return (
        <Stack direction="row" justifyContent="center" sx={{ color: (theme) => theme.vars.palette.text.secondary }}>
            <ProjectsButton />
            <GitHubButton />
            <FeedbackButton />
        </Stack>
    );
};
