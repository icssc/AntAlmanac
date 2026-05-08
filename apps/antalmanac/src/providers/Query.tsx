import { trpcReact } from '$lib/api/trpcReact';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';

export default function AppQueryProvider({ children }: { children?: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60_000,
                        retry: 1,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    const [trpcClient] = useState(() =>
        trpcReact.createClient({
            links: [
                httpBatchLink({
                    url: '/api/trpc',
                    transformer: superjson,
                    fetch(url, options) {
                        return fetch(url, { ...options, credentials: 'include' });
                    },
                }),
            ],
        })
    );

    return (
        <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
                {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
            </QueryClientProvider>
        </trpcReact.Provider>
    );
}
