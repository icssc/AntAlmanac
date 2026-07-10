import SaveIcon from '@mui/icons-material/Save';
import { Button } from '@mui/material';
import { type FC, useCallback, useEffect, useState } from 'react';

import { useIsLoggedIn } from '../../hooks/isLoggedIn';
import { useSaveRoadmap } from '../../hooks/planner';
import { useAppSelector } from '../../store/hooks';

const SaveButton: FC = () => {
    const { handler: saveRoadmap } = useSaveRoadmap();
    const roadmapLoading = useAppSelector((state) => state.roadmap.roadmapLoading);
    const customCoursesLoaded = useAppSelector((state) => state.customCourses.customCoursesLoaded);
    const isLoggedIn = useIsLoggedIn();

    const [saveInProgress, setSaveInProgress] = useState(false);
    const saveDisabled = roadmapLoading || (isLoggedIn && !customCoursesLoaded) || saveInProgress;

    const handleSave = useCallback(() => {
        if (saveDisabled) return;
        setSaveInProgress(true);
        saveRoadmap().finally(() => setSaveInProgress(false));
    }, [saveDisabled, saveRoadmap]);

    useEffect(() => {
        const handleShortcut = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() !== 's') return;
            if (event.ctrlKey === event.metaKey) return;
            if (event.altKey || event.shiftKey) return;

            event.preventDefault();
            if (event.repeat) return;
            handleSave();
        };

        window.addEventListener('keydown', handleShortcut);
        return () => window.removeEventListener('keydown', handleShortcut);
    }, [handleSave]);

    return (
        <Button
            className="header-button"
            variant="text"
            size="medium"
            startIcon={<SaveIcon />}
            loading={saveInProgress}
            disabled={saveDisabled}
            onClick={handleSave}
            color="inherit"
            aria-label="Save"
        >
            Save
        </Button>
    );
};

export default SaveButton;
