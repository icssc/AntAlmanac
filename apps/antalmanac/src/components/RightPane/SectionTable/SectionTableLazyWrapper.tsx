import { SectionTableProps } from '$components/RightPane/SectionTable/SectionTable.types';
import { lazy, Suspense } from 'react';

// This should be in SectionTable.tsx, IMO
const SectionTable = lazy(() => import('./SectionTable'));

export default function SectionTableLazyWrapper(props: SectionTableProps) {
    return (
        <Suspense fallback={<div></div>}>
            <SectionTable {...props} />
        </Suspense>
    );
}
