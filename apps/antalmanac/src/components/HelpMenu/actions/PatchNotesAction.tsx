import { Campaign } from '@mui/icons-material';
import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { HelpMenuAction } from '$components/HelpMenu/HelpMenu';
import { useHelpMenuStore } from '$stores/HelpMenuStore';

export function PatchNotesAction(): HelpMenuAction {
    const setShowPatchNotes = useHelpMenuStore(useShallow((store) => store.setShowPatchNotes));

    const handleClick = useCallback(() => {
        setShowPatchNotes(true);
    }, [setShowPatchNotes]);

    return { icon: <Campaign />, name: 'View Patch Notes', onClick: handleClick };
}
