import { useIsMobileUserAgent } from '$components/MobileUserAgentProvider';
import { type TabName } from '$lib/tabs/tabs';
import { useSelectedLayoutSegment } from 'next/navigation';

export function useActiveTab(): TabName {
    const segment = useSelectedLayoutSegment();
    const isMobile = useIsMobileUserAgent();

    if (segment === 'calendar') {
        return isMobile ? 'calendar' : 'search';
    }

    if (segment === 'added' || segment === 'map') {
        return segment;
    }

    return 'search';
}
