import { QueryClient } from '@tanstack/react-query';
import superjson from 'superjson';

export function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60_000,
                retry: 1,
                refetchOnWindowFocus: false,
            },
            dehydrate: {
                serializeData: superjson.serialize,
            },
            hydrate: {
                deserializeData: superjson.deserialize,
            },
        },
    });
}
