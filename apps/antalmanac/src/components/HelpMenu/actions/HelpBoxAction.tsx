import { Help } from '@mui/icons-material';
import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { HelpMenuAction } from '$components/HelpMenu/HelpMenu';
import { setLocalStorageExpandAboutBox } from '$lib/localStorage';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useHelpMenuStore } from '$stores/HelpMenuStore';
import { useTabStore } from '$stores/TabStore';

export function HelpBoxAction(): HelpMenuAction {
    const setActiveTab = useTabStore(useShallow((store) => store.setActiveTab));
    const [expandAboutBox, toggleExpandAboutBox] = useHelpMenuStore(
        useShallow((store) => [store.expandAboutBox, store.toggleExpandAboutBox])
    );
    const [displaySearch, disableManualSearch] = useCoursePaneStore(
        useShallow((store) => [store.displaySearch, store.disableManualSearch])
    );

    const handleClick = useCallback(() => {
        setActiveTab('search');
        toggleExpandAboutBox();
        setLocalStorageExpandAboutBox('true');
        displaySearch();
        disableManualSearch();
    }, [disableManualSearch, displaySearch, setActiveTab, toggleExpandAboutBox]);

    return expandAboutBox ? null : { icon: <Help />, name: 'Show Helpful Info', onClick: handleClick };
}
