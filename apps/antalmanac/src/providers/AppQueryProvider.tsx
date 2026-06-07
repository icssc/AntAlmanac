import { createQueryClient } from '$lib/api/query-client';
import { trpcConfig, trpcReact } from '$lib/api/trpc';
import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function AppQueryProvider({ children }: { children?: React.ReactNode }) {
    const [queryClient] = useState(createQueryClient);
    const [trpcClient] = useState(() => trpcReact.createClient(trpcConfig));

    return (
        <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </trpcReact.Provider>
    );
}
