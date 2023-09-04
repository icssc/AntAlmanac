import transformer from 'superjson';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../../backend/src/routers';
import { ANTALMANAC_API_ENDPOINT } from './endpoints';

export const trpc = createTRPCProxyClient<AppRouter>({
    transformer,
    links: [
        httpBatchLink({
            url: `${ANTALMANAC_API_ENDPOINT}/trpc`,
        }),
    ],
});

export default trpc;
