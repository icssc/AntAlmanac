import React, { Suspense } from 'react';

const LazyMobileLogo = () => {
    const Svg = React.lazy(() => import('./MobileLogo'));
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Svg height={32} />
        </Suspense>
    );
};

export default LazyMobileLogo;
