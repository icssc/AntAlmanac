import React, { Suspense } from 'react';

const LazyLogo = () => {
    const Logo = React.lazy(() => import('./Logo'));
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
            <Logo height={32} />
        </Suspense>
    );
};

export default LazyLogo;
