import { lazy, Suspense } from 'react';

import { SectionTableSkeleton } from '$components/RightPane/AddedCourses/AddedCoursePane';
import { SectionTableProps } from '$components/RightPane/SectionTable/SectionTable.types';

// This should be in SectionTable.tsx, IMO
const SectionTable = lazy(() => import('./SectionTable'));

export default function SectionTableLazyWrapper(props: SectionTableProps) {
    return (
        <Suspense fallback={<SectionTableSkeleton />}>
            <SectionTable {...props} />
        </Suspense>
    );
}
