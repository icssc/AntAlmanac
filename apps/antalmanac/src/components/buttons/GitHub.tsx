import { GitHub } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';

import { GITHUB_LINK } from '$src/globals';

const GitHubButton = () => {
    return (
        <Tooltip title="Check out our GitHub!">
            <Button
                color="inherit"
                startIcon={<GitHub />}
                size="large"
                variant="text"
                href={GITHUB_LINK}
                target="_blank"
            >
                GitHub
            </Button>
        </Tooltip>
    );
};

export default GitHubButton;
