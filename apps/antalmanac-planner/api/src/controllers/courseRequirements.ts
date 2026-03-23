import { router, userProcedure } from '../helpers/trpc';
import { db } from '../db';
import { completedMarkerRequirement } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

const courseRequirementsRouter = router({
  getCompletedMarkers: userProcedure.query(async ({ ctx }) => {
    const response = await db
      .select({ markerName: completedMarkerRequirement.markerName })
      .from(completedMarkerRequirement)
      .where(eq(completedMarkerRequirement.userId, ctx.session.userId!));

    return response;
  }),
  addCompletedMarker: userProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.userId!;
    await db.insert(completedMarkerRequirement).values({ userId, markerName: input });
  }),
  removeCompletedMarker: userProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    await db
      .delete(completedMarkerRequirement)
      .where(
        and(
          eq(completedMarkerRequirement.userId, ctx.session.userId!),
          eq(completedMarkerRequirement.markerName, input),
        ),
      );
  }),
});

export default courseRequirementsRouter;
