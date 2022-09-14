import React, { Suspense } from 'react';
import { SectionTableProps } from './SectionTable.types';

const SectionTable = React.lazy(() => import('./SectionTable'));

export default function SectionTableLazyWrapper(props: SectionTableProps) {
    return (
        <Suspense fallback={<div></div>}>
            <SectionTable {...props} />
        </Suspense>
    );
}
