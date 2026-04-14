import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

import { AppRouter } from '$src/backend/routers';

const trpc = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: '/api/trpc',
            fetch(url, options) {
                // Double-encode %26 so CloudFront's URL decoding produces
                // the correct %26 for the origin server instead of a bare &.
                const fixedUrl = typeof url === 'string' ? url.replaceAll('%26', '%2526') : url;
                return fetch(fixedUrl, {
                    ...options,
                    credentials: 'include', // Send cookies with requests
                });
            },
        }),
    ],
    transformer: superjson,
});

export default trpc;
