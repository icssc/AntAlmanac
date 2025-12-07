import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

import { AppRouter } from '$src/backend/routers';

function getEndpoint() {
    if (process.env.NEXT_PUBLIC_ENDPOINT) {
        return `https://${process.env.NEXT_PUBLIC_ENDPOINT}.api.antalmanac.com`;
    }
    if (process.env.NEXT_PUBLIC_LOCAL_SERVER) {
        return `http://localhost:3000`;
    }
    return process.env.NODE_ENV === 'development' ? `https://dev.api.antalmanac.com` : `https://api.antalmanac.com`;
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
