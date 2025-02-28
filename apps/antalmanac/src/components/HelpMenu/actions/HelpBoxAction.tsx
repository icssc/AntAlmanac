import { Help } from '@mui/icons-material';
import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useHelpMenuStore } from '$stores/HelpMenuStore';
import { useTabStore } from '$stores/TabStore';

export function HelpBoxAction() {
    const setActiveTab = useTabStore(useShallow((store) => store.setActiveTab));
    const setShowHelpBox = useHelpMenuStore(useShallow((store) => store.setShowHelpBox));
    const [displaySearch, disableManualSearch] = useCoursePaneStore(
        useShallow((store) => [store.displaySearch, store.disableManualSearch])
    );

    const handleClick = useCallback(() => {
        setActiveTab('search');
        setShowHelpBox(true);
        displaySearch();
        disableManualSearch();
    }, [disableManualSearch, displaySearch, setActiveTab, setShowHelpBox]);

    return { icon: <Help />, name: 'Show Helpful Info', onClick: handleClick };
}
