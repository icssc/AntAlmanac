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
            // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-limits.html#limits-general
            maxURLLength: 8192,
        }),
    ],
});

export default trpc;
