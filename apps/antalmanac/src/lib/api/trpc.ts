import { createTRPCProxyClient, httpBatchLink, httpLink, splitLink } from '@trpc/client';
import superjson from 'superjson';

import type { AppRouter } from '../../../../backend/src/routers';

function getEndpoint() {
    if (import.meta.env.VITE_ENDPOINT) {
        return `https://${import.meta.env.VITE_ENDPOINT}.api.antalmanac.com`;
    }
    if (import.meta.env.VITE_LOCAL_SERVER) {
        return `http://localhost:3000`;
    }
    return import.meta.env.MODE === 'development' ? `https://dev.api.antalmanac.com` : `https://api.antalmanac.com`;
}

const url = getEndpoint() + '/trpc';
const trpc = createTRPCProxyClient<AppRouter>({
    links: [
        splitLink({
            condition(op) {
                return op.context.skipBatch === true;
            },
            true: httpLink({
                url,
            }),
            // when condition is false, use batching
            false: httpBatchLink({
                url,
            }),
        }),

        httpBatchLink({
            url: getEndpoint() + '/trpc',
        }),
    ],
    transformer: superjson,
});

export default trpc;
