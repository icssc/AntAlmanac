import { AppRouter } from '$src/backend/routers';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

const trpc = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: '/api/trpc',
            transformer: superjson,
            fetch(url, options) {
                return fetch(url, {
                    ...options,
                    credentials: 'include', // Send cookies with requests
                });
            },
        }),
    ],
});

export default trpc;
