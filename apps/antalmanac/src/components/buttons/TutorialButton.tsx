import { PlayLesson } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useCallback } from 'react';

import { TutorialAction } from '$components/HelpMenu/actions/TutorialAction';

export const TutorialButton = () => {
    const action = TutorialAction();

    const handleClick = useCallback(() => {
        action?.onClick();
    }, [action]);

    if (!action) {
        return null;
    }

    return (
        <Button onClick={handleClick} color="inherit" startIcon={<PlayLesson />} size="large" variant="text">
            Tutorial
        </Button>
    );
};
