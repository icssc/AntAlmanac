import React, { Suspense } from 'react';

const LazyUCIMap = () => {
    const UCIMap = React.lazy(() => import('./UCIMap'));
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UCIMap />
        </Suspense>
    );
};

export default LazyUCIMap;
