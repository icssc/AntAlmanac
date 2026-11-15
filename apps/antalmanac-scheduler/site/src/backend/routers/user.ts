import { getUserMajors, setUserMajors } from '$backend/lib/rds/users';
import { protectedProcedure, router } from '$backend/trpc';
import { db } from '@packages/db';
import { z } from 'zod';

const UpdateUserMajorSchoolsSchema = z.object({
    majors: z.array(z.string()).min(1).max(3),
});

const userRouter = router({
    get: protectedProcedure.query(async ({ ctx }) => {
        return await getUserMajors(db, ctx.userId);
    }),

    updateMajorSchools: protectedProcedure.input(UpdateUserMajorSchoolsSchema).mutation(async ({ input, ctx }) => {
        await setUserMajors(db, ctx.userId, input.majors);
    }),
});

export default userRouter;
