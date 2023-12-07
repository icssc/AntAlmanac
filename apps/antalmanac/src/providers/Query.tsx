import { useState } from 'react';
import { parse } from 'cookie';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import trpc from '$lib/api/trpc';

interface Props {
    children?: React.ReactNode;
}

function getEndpoint() {
    if (import.meta.env.VITE_ENDPOINT) {
        return `https://${import.meta.env.VITE_ENDPOINT}.api.antalmanac.com`;
    }
    if (import.meta.env.VITE_LOCAL_SERVER) {
        return `http://localhost:3000`;
    }
    return import.meta.env.MODE === 'development' ? `https://dev.api.antalmanac.com` : `https://api.antalmanac.com`;
}

export default function AppQueryProvider(props: Props) {
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: getEndpoint() + '/trpc',
                    headers: async () => {
                        return {
                            Authorization: parse(document.cookie).access_token,
                        };
                    },
                }),
            ],
            transformer: superjson,
        })
    );

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
        </trpc.Provider>
    );
}
