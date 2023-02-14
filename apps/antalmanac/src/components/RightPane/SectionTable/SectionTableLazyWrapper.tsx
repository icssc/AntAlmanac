import React, { Suspense } from 'react';

import { SectionTableProps } from './SectionTable.types';

// This should be in SectionTable.tsx, IMO
const SectionTable = React.lazy(() => import('./SectionTable'));

export default function SectionTableLazyWrapper(props: SectionTableProps) {
    return (
        <Suspense fallback={<div></div>}>
            <SectionTable {...props} />
        </Suspense>
    );
}
