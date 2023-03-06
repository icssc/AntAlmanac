import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@apps/server/routes'

/**
 * @see {@link https://trpc.io/docs/react#2-create-trpc-hooks}
 */
const trpc = createTRPCReact<AppRouter>()
export default trpc
