import { AppRouter } from '$src/backend/routers';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

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
            // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-limits.html#limits-general
            maxURLLength: 8192,
        }),
    ],
    transformer: superjson,
});

export default trpc;
