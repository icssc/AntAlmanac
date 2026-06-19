import { TRPCError } from '@trpc/server';
import { publicProcedure, router } from '../../helpers/trpc';
import { user } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db';
import { queryGetPlanners } from '../../helpers/roadmap';

const externalRoadmapsRouter = router({
  getByEmail: publicProcedure.input(z.object({ email: z.string() })).query(async ({ input, ctx }) => {
    const authToken = ctx.req.headers.authorization;
    if (authToken !== `Bearer ${process.env.EXTERNAL_USER_READ_SECRET}`) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const [matchedUser] = await db.select({ id: user.id }).from(user).where(eq(user.email, input.email));
    if (!matchedUser) return [];

    return await queryGetPlanners(eq(user.id, matchedUser.id));
  }),
});

export default externalRoadmapsRouter;
