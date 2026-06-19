import { z } from 'zod';
import { router, userProcedure } from '../helpers/trpc';
import { db } from '../db';
import { customCard, plannerCourse } from '../db/schema';
import { and, asc, eq } from 'drizzle-orm';

const zodCustomCardInput = z.object({
  name: z.string(),
  description: z.string(),
  units: z.number().min(0),
});

const zodCustomCardUpdate = zodCustomCardInput.extend({
  id: z.number().int(),
});

export const customCoursesRouter = router({
  getCustomCards: userProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(customCard)
      .where(eq(customCard.userId, ctx.session.userId!))
      .orderBy(asc(customCard.id));
  }),

  addCustomCard: userProcedure.input(zodCustomCardInput).mutation(async ({ input, ctx }) => {
    const [newCard] = await db
      .insert(customCard)
      .values({
        userId: ctx.session.userId!,
        name: input.name,
        description: input.description,
        units: input.units,
      })
      .returning({ id: customCard.id });

    return newCard.id;
  }),

  editCustomCard: userProcedure.input(zodCustomCardUpdate).mutation(async ({ input, ctx }) => {
    await db
      .update(customCard)
      .set({
        name: input.name,
        description: input.description,
        units: input.units,
      })
      .where(and(eq(customCard.id, input.id), eq(customCard.userId, ctx.session.userId!)));
    return true;
  }),

  deleteCustomCard: userProcedure.input(z.number().int()).mutation(async ({ input: cardId, ctx }) => {
    await db.delete(plannerCourse).where(eq(plannerCourse.customCardId, cardId));

    await db.delete(customCard).where(and(eq(customCard.id, cardId), eq(customCard.userId, ctx.session.userId!)));
    return true;
  }),
});
