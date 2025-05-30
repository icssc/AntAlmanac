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

const trpcUrl = getEndpoint() + '/trpc';

const trpc = createTRPCProxyClient<AppRouter>({
    links: [
        // NB: This allows us to skip batching for certain operations.
        splitLink({
            condition(op) {
                return op.context.skipBatch === true;
            },
            true: httpLink({
                url: trpcUrl,
            }),
            false: httpBatchLink({
                url: trpcUrl,
            }),
        }),

        httpBatchLink({
            url: trpcUrl,
        }),
    ],
    transformer: superjson,
});

export default trpc;
