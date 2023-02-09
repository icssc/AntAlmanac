import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * wraps the application with an initialized query client and query provider
 */
export default function AppQueryProvider(props: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
}
