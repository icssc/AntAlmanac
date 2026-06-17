import { TAB_HREF, TAB_INDEX, isTabRouteSegment, type TabName } from '$lib/tabs/tabs';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/** Active tab index derived from the URL (`/`, `/calendar`, `/added`, `/map`). */
export function useActiveTabIndex(): number {
    const { tab } = useParams();

    if (isTabRouteSegment(tab)) {
        return TAB_INDEX[tab];
    }

    return TAB_INDEX.search;
}

export function useGoToTab() {
    const navigate = useNavigate();

    return useCallback((name: TabName) => navigate(TAB_HREF[name]), [navigate]);
}
