import { useIsMobile } from '$hooks/useIsMobile';
import { type TabName } from '$lib/tabs/tabs';
import { useSelectedLayoutSegment } from 'next/navigation';

export function useActiveTab(): TabName {
    const segment = useSelectedLayoutSegment();
    const isMobile = useIsMobile();

    if (segment === 'calendar') {
        return isMobile ? 'calendar' : 'search';
    }

    if (segment === 'added' || segment === 'map') {
        return segment;
    }

    return 'search';
}
