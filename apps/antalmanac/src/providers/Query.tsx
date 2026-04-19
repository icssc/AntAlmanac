import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

interface Props {
    children?: React.ReactNode;
}

export default function AppQueryProvider(props: Props) {
    const [queryClient] = useState(() => new QueryClient());

    return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
}
