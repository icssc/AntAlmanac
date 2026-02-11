import { PlayLesson } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useCallback } from 'react';

import { TutorialAction } from '$components/HelpMenu/actions/TutorialAction';

interface TutorialButtonProps {
    onMenuClose?: () => void;
}

export const TutorialButton = ({ onMenuClose }: TutorialButtonProps) => {
    const action = TutorialAction();

    const handleClick = useCallback(() => {
        onMenuClose?.();
        action?.onClick();
    }, [action, onMenuClose]);

    if (!action) {
        return null;
    }

    return (
        <Button onClick={handleClick} color="inherit" startIcon={<PlayLesson />} size="large" variant="text">
            Tutorial
        </Button>
    );
};
