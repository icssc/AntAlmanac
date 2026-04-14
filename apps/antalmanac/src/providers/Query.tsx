import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface Props {
    children?: React.ReactNode;
}

export default function AppQueryProvider(props: Props) {
    const [queryClient] = useState(() => new QueryClient());

    return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
}
