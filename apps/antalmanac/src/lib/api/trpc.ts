import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

import { AppRouter } from '$src/backend/routers';

function getEndpoint() {
    return process.env.NEXT_PUBLIC_BASE_URL ?? `http://localhost:3000`;
}

const trpc = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: getEndpoint() + '/api/trpc',
        }),
    ],
    transformer: superjson,
});

export default trpc;
