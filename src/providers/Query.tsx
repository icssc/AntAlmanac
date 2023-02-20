import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface Props {
  children?: React.ReactNode
}

/**
 * wraps the application with an initialized query client and query provider
 */
export default function AppQueryProvider(props?: Props) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
    },
  })

  return <QueryClientProvider client={queryClient}>{props?.children}</QueryClientProvider>
}
