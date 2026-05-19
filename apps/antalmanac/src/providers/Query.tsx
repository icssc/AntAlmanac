import { trpcConfig, trpcReact } from '$lib/api/trpc';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

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

    const [trpcClient] = useState(() => trpcReact.createClient(trpcConfig));

    return (
        <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </trpcReact.Provider>
    );
}
