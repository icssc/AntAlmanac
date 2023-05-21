import { ClassNameMap } from '@material-ui/core/styles/withStyles';

import { AACourse } from '@packages/antalmanac-types';

/**
 * This is in its own file so we can import it in SectionTableLazyWrapper without messing up the lazy-load.
 * If you can figure out how to export this from SectionTable.tsx to SectionTableLazyWrapper.tsx, do it.
 */
export interface SectionTableProps {
    classes?: ClassNameMap;
    courseDetails: AACourse;
    term: string;
    colorAndDelete: boolean;
    highlightAdded: boolean;
    scheduleNames: string[];
    analyticsCategory: string;
}
