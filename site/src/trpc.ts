import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { type AppRouter } from '../../api/src/controllers';

const TRPC_ENDPOINT = '/planner/api/trpc';

const buildTrpcUrl = (headers?: Record<string, string>) => {
  if (!headers) return TRPC_ENDPOINT;

  const protocol = headers['x-forwarded-proto'] ?? 'http';
  const host = headers['x-forwarded-host'] ?? headers.host ?? 'localhost:3000';

  return `${protocol}://${host}${TRPC_ENDPOINT}`;
};

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: TRPC_ENDPOINT,
    }),
  ],
});

/*
 * "Proper way", if you are brave enough:
 * https://trpc.io/docs/client/react/server-components#5-create-a-trpc-caller-for-server-components
 */

export const createServerSideTrpcCaller = (headers: Record<string, string>) => {
  return createTRPCProxyClient<AppRouter>({
    links: [httpBatchLink({ url: buildTrpcUrl(headers), headers })],
  });
};

export default trpc;
