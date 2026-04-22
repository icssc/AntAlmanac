import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

import { AppRouter } from '$src/backend/routers';

const trpc = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: '/api/trpc',
            fetch(url, options) {
                return fetch(url, {
                    ...options,
                    credentials: 'include', // Send cookies with requests
                });
            },
        }),
    ],
    transformer: superjson,
});

export default trpc;
