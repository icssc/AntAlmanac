import React, { Suspense } from 'react';

const LazyLogo = () => {
    const Svg = React.lazy(() => import('./Logo'));
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Svg height={32} />
        </Suspense>
    );
};

export default LazyLogo;
