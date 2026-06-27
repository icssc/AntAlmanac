import { type TabName } from '$lib/tabs/tabs';
import { useSelectedLayoutSegment } from 'next/navigation';

export function useActiveTab(): TabName {
    const segment = useSelectedLayoutSegment();

    if (segment === 'calendar' || segment === 'added' || segment === 'map') {
        return segment;
    }

    return 'search';
}
