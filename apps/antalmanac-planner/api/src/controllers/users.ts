/**
 @module UsersRoute
*/

import { router, userProcedure } from '../helpers/trpc';
import { theme, UserData } from '@peterportal/types';
import { db } from '../db';
import { user } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { datesToStrings } from '../helpers/date';

const usersRouter = router({
  /**
   * Get the user's data
   */
  get: userProcedure.query(async ({ ctx }) => {
    const userData = (await db.select().from(user).where(eq(user.id, ctx.session.userId!)))[0];
    return datesToStrings({
      ...userData,
      isAdmin: ctx.session.isAdmin,
    }) as UserData;
  }),

  /**
   * Configure the user's theme preferences
   */
  setTheme: userProcedure.input(z.object({ theme })).mutation(async ({ input, ctx }) => {
    await db.update(user).set({ theme: input.theme }).where(eq(user.id, ctx.session.userId!));
    return input;
  }),
});

export default usersRouter;
