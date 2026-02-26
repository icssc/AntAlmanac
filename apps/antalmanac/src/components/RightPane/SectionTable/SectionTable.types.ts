import type { AACourse } from '@packages/antalmanac-types';

import { AnalyticsCategory } from '$lib/analytics/analytics';

/**
 * This is in its own file so we can import it in SectionTableLazyWrapper without messing up the lazy-load.
 * If you can figure out how to export this from SectionTable.tsx to SectionTableLazyWrapper.tsx, do it.
 */
export interface SectionTableProps {
    courseDetails: AACourse;
    term: string;
    allowHighlight: boolean;
    scheduleNames: string[];
    analyticsCategory: AnalyticsCategory;
    updatedAt?: string;
    missingSections?: string[];
}
