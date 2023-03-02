import { useState } from 'react'
import { httpBatchLink } from '@trpc/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import trpc from '$lib/trpc'

interface Props {
  children?: React.ReactNode
}

/**
 * wraps the application with an initialized trpc + query client and provider
 */
export default function AppQueryProvider(props: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
          },
        },
      })
  )

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:5000/trpc',
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
    </trpc.Provider>
  )
}
