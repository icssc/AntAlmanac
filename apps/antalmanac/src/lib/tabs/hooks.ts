import { useIsMobile } from '$hooks/useIsMobile';
import { type TabName } from '$lib/tabs/tabs';
import { useParams } from 'react-router-dom';

export function useActiveTab(): TabName {
    const { tab } = useParams();
    const isMobile = useIsMobile();

    if (tab === 'calendar') {
        return isMobile ? 'calendar' : 'search';
    }

    if (tab === 'added' || tab === 'map') {
        return tab;
    }

    return 'search';
}
