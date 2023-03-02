import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@apps/server/routes';

const trpc = createTRPCReact<AppRouter>()
export default trpc
