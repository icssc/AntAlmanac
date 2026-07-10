import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '../db';
import { courseNotes } from '../db/schema';
import { router, userProcedure } from '../helpers/trpc';

export const courseNotesRouter = router({
    get: userProcedure.input(z.object({ courseId: z.string() })).query(async ({ ctx, input }) => {
        const userId = ctx.session.userId;
        const courseId = input.courseId;
        const note = await db
            .select({
                user: courseNotes.userId,
                courseId: courseNotes.courseId,
                content: courseNotes.content,
                timeCreated: courseNotes.createdAt,
            })
            .from(courseNotes)
            .where(and(eq(courseNotes.userId, userId!), eq(courseNotes.courseId, courseId)));
        return note;
    }),

    add: userProcedure
        .input(z.object({ courseId: z.string(), content: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.userId;
            const courseId = input.courseId;
            const content = input.content;
            await db.insert(courseNotes).values({ userId, courseId, content });
            return;
        }),

    edit: userProcedure
        .input(z.object({ courseId: z.string(), content: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.userId;
            const courseId = input.courseId;
            const content = input.content;

            const result = await db
                .update(courseNotes)
                .set({ content: content })
                .where(and(eq(courseNotes.userId, userId!), eq(courseNotes.courseId, courseId)))
                .returning();

            if (!result.length) {
                throw new TRPCError({ code: 'NOT_FOUND' });
            }
        }),

    delete: userProcedure.input(z.object({ courseId: z.string() })).mutation(async ({ ctx, input }) => {
        const userId = ctx.session.userId;
        const courseId = input.courseId;

        const result = await db
            .delete(courseNotes)
            .where(and(eq(courseNotes.userId, userId!), eq(courseNotes.courseId, courseId)))
            .returning();

        if (!result.length) {
            throw new TRPCError({ code: 'NOT_FOUND' });
        }
    }),
});
