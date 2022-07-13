import React, { Suspense } from 'react';

const LazyMobileLogo = () => {
    const MobileLogo = React.lazy(() => import('./MobileLogo'));
    return (
        <Suspense
            fallback={
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    Loading...
                </div>
            }
        >
            <MobileLogo height={32} />
        </Suspense>
    );
};

export default LazyMobileLogo;
