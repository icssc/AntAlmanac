import { useIsMobile } from '$hooks/useIsMobile';
import { TAB_INDEX } from '$lib/tabs/tabs';
import { useParams } from 'react-router-dom';

export function useActiveTabIndex(): number {
    const { tab } = useParams();
    const isMobile = useIsMobile();

    if (tab === 'calendar') {
        return isMobile ? TAB_INDEX.calendar : TAB_INDEX.search;
    }

    if (tab === 'added' || tab === 'map') {
        return TAB_INDEX[tab];
    }

    return TAB_INDEX.search;
}
