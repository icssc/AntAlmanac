import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import transformer from 'superjson';

import { getEndpoint } from '$lib/api/trpc';
import { trpc } from '$lib/trpc';

interface Props {
    children?: React.ReactNode;
}

export default function AppQueryProvider(props: Props) {
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() =>
        trpc.createClient({
            transformer,
            links: [
                httpBatchLink({
                    url: getEndpoint() + '/trpc',
                    headers: () => {
                        return {
                            credentials: 'include',
                        };
                    },
                }),
            ],
        })
    );

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
        </trpc.Provider>
    );
}
