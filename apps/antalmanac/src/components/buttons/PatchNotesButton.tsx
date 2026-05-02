import { usePatchNotesStore } from '$stores/PatchNotesStore';
import { Campaign } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const PatchNotesButton = () => {
    const setShowPatchNotes = usePatchNotesStore(useShallow((store) => store.setShowPatchNotes));

    const handleClick = useCallback(() => {
        setShowPatchNotes(true);
    }, [setShowPatchNotes]);

    return (
        <Button onClick={handleClick} color="inherit" startIcon={<Campaign />} size="large" variant="text">
            Patch Notes
        </Button>
    );
};
