import React, { Suspense } from 'react';

const SectionTable = React.lazy(() => import('./SectionTable'));

export default function SectionTableLazyWrapper(props) {
    return (
        <Suspense fallback={<div></div>}>
            <SectionTable {...props} />
        </Suspense>
    );
}
