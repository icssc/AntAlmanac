import { AppRouter } from '$src/backend/routers';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';

export const trpcReact = createTRPCReact<AppRouter>();

export const trpcConfig = {
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
};

const trpc = createTRPCClient<AppRouter>(trpcConfig);

export default trpc;
