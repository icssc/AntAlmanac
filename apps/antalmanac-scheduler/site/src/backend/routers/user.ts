import { getUserMajorSchools, updateUserMajorSchools } from '$backend/lib/rds/users';
import { protectedProcedure, router } from '$backend/trpc';
import { SchoolSchema } from '@packages/antalmanac-types';
import { db } from '@packages/db';
import { z } from 'zod';

const UpdateUserMajorSchoolsSchema = z.object({
    major: z.string(),
    schools: z.array(SchoolSchema).min(1).max(SchoolSchema.options.length),
});

const userRouter = router({
    get: protectedProcedure.query(async ({ ctx }) => {
        return await getUserMajorSchools(db, ctx.userId);
    }),

    updateMajorSchools: protectedProcedure.input(UpdateUserMajorSchoolsSchema).mutation(async ({ input, ctx }) => {
        await updateUserMajorSchools(db, ctx.userId, input.major, input.schools);
    }),
});

export default userRouter;
