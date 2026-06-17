import { useIsMobile } from '$hooks/useIsMobile';
import { TAB_HREF, TAB_INDEX, type TabName } from '$lib/tabs/tabs';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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

export function useGoToTab() {
    const navigate = useNavigate();

    return useCallback((name: TabName) => navigate(TAB_HREF[name]), [navigate]);
}
