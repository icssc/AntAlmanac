import { z } from 'zod';
import { router, userProcedure } from '../helpers/trpc';
import { db } from '../db';
import { savedCourse } from '../db/schema';
import { and, eq } from 'drizzle-orm';

export const savedCoursesRouter = router({
  get: userProcedure.query(async ({ ctx }) => {
    return (
      await db
        .select({ courseId: savedCourse.courseId })
        .from(savedCourse)
        .where(eq(savedCourse.userId, ctx.session.userId!))
    ).map((row) => row.courseId);
  }),
  add: userProcedure.input(z.object({ courseId: z.string() })).mutation(async ({ input, ctx }) => {
    await db.insert(savedCourse).values({ userId: ctx.session.userId!, courseId: input.courseId });
  }),
  remove: userProcedure.input(z.object({ courseId: z.string() })).mutation(async ({ input, ctx }) => {
    await db
      .delete(savedCourse)
      .where(and(eq(savedCourse.userId, ctx.session.userId!), eq(savedCourse.courseId, input.courseId)));
  }),
});
