import { TAB_INDEX, getTabHref, isTabRouteSegment, type TabName } from '$lib/tabs/tabs';
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

export type GoToTab = (name: TabName) => void;

/** Navigate to a tab route. Use in components — pass into plain helpers (e.g. tour steps) via callback. */
export function useGoToTab(): GoToTab {
    const navigate = useNavigate();

    return useCallback((name: TabName) => navigate(getTabHref(name)), [navigate]);
}
