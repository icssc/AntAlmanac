'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('$src/App').then((m) => ({ default: m.App })), { ssr: false });

export function ClientOnly() {
    return <App />;
}
