import { getUserMajorsSchools, updateUserMajorsSchools } from '$backend/lib/rds/users';
import { protectedProcedure, router } from '$backend/trpc';
import { SchoolSchema } from '@packages/antalmanac-types';
import { db } from '@packages/db';
import { z } from 'zod';

const UpdateUserMajorSchoolsSchema = z.object({
    majors: z.array(z.string()).min(1).max(3),
    schools: z.array(SchoolSchema).min(1).max(SchoolSchema.options.length),
});

const userRouter = router({
    get: protectedProcedure.query(async ({ ctx }) => {
        return await getUserMajorsSchools(db, ctx.userId);
    }),

    updateMajorSchools: protectedProcedure.input(UpdateUserMajorSchoolsSchema).mutation(async ({ input, ctx }) => {
        await updateUserMajorsSchools(db, ctx.userId, input.majors, input.schools);
    }),
});

export default userRouter;
