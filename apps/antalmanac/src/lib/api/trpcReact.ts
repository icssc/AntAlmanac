import type { AppRouter } from '$src/backend/routers';
import { createTRPCReact } from '@trpc/react-query';

export const trpcReact = createTRPCReact<AppRouter>();
