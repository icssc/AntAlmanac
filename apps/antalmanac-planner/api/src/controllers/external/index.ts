/** Defines all routers for integration with other ICSSC Projects */
import { router } from '../../helpers/trpc';
import externalRoadmapsRouter from './roadmap';

export const externalAppRouter = router({
  roadmaps: externalRoadmapsRouter,
});

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type ExternalAppRouter = typeof externalAppRouter;
