import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../../backend/src/routers';

const trpc = createTRPCReact<AppRouter>({});

export default trpc;
