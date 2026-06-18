'use client';

import dynamic from 'next/dynamic';

const Client = dynamic(() => import('$src/app/(main)/client').then((module) => ({ default: module.Client })), {
    ssr: false,
});

export function ClientShell() {
    return <Client />;
}
