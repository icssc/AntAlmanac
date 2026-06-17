import { TAB_HREF, TAB_INDEX, type TabName } from '$lib/tabs/tabs';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export function useActiveTabIndex(): number {
    const { tab } = useParams();

    if (!(tab === 'calendar') && !(tab === 'added') && !(tab === 'map')) {
        return TAB_INDEX.search;
    }

    return TAB_INDEX[tab];
}

export function useGoToTab() {
    const navigate = useNavigate();

    return useCallback((name: TabName) => navigate(TAB_HREF[name]), [navigate]);
}
