import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from 'antalmanac-backend/src/routers';
import superjson from 'superjson';

export function getEndpoint() {
    if (import.meta.env.VITE_ENDPOINT) {
        return `https://${import.meta.env.VITE_ENDPOINT}.api.antalmanac.com`;
    }
    if (import.meta.env.VITE_LOCAL_SERVER) {
        return `http://localhost:3000`;
    }
    return import.meta.env.MODE === 'development' ? `https://dev.api.antalmanac.com` : `https://api.antalmanac.com`;
}

const trpc = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: getEndpoint() + '/trpc',
        }),
    ],
    transformer: superjson,
});

export default trpc;
