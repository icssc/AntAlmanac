import { TRPCError } from '@trpc/server';
import { publicProcedure, router } from '../../helpers/trpc';
import { user } from '../../db/schema';
import { eq, or } from 'drizzle-orm';
import { z } from 'zod';
import { queryGetPlanners } from '../../helpers/roadmap';

const externalRoadmapsRouter = router({
  getByGoogleID: publicProcedure.input(z.object({ googleUserId: z.string() })).query(async ({ input, ctx }) => {
    const authToken = ctx.req.headers.authorization;
    if (authToken !== 'Bearer ' + process.env.EXTERNAL_USER_READ_SECRET) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const idLegacy = input.googleUserId;
    const idPrefixed = `google_${idLegacy}`;

    const where = or(eq(user.googleId, idPrefixed), eq(user.googleId, idLegacy))!;
    const planners = await queryGetPlanners(where);

    return planners;
  }),
});

export default externalRoadmapsRouter;
