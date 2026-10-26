import { getUserMajorSchool, updateUserMajor } from '$backend/lib/rds/users';
import { protectedProcedure, router } from '$backend/trpc';
import { SchoolSchema } from '@packages/antalmanac-types';
import { db } from '@packages/db';
import { z } from 'zod';

const UpdateUserMajorSchoolSchema = z.object({
    major: z.string(),
    school: SchoolSchema,
});

const userRouter = router({
    get: protectedProcedure.query(async ({ ctx }) => {
        return await getUserMajorSchool(db, ctx.userId);
    }),

    updateMajorSchool: protectedProcedure.input(UpdateUserMajorSchoolSchema).mutation(async ({ input, ctx }) => {
        await updateUserMajor(db, ctx.userId, input.major, input.school);
    }),
});

export default userRouter;
