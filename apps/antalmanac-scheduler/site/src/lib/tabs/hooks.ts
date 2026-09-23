import { useIsMobile } from '$hooks/useIsMobile';
import { type TabName, getTabFromPathname } from '$lib/tabs/tabs';
import { usePathname } from 'next/navigation';

export function useActiveTab(): TabName {
    const tab = getTabFromPathname(usePathname());
    const isMobile = useIsMobile();

    if (tab === 'calendar') {
        return isMobile ? 'calendar' : 'search';
    }

    return tab;
}
