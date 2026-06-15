import { TAB_INDEX, isTabRouteSegment } from '$stores/TabStore';
import { useParams } from 'react-router-dom';

/** Active tab index derived from the URL (`/`, `/calendar`, `/added`, `/map`). */
export function useActiveTabIndex(): number {
    const { tab } = useParams();

    if (isTabRouteSegment(tab)) {
        return TAB_INDEX[tab];
    }

    return TAB_INDEX.search;
}
