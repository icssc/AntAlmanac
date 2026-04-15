import { RDS } from '$src/backend/lib/rds';
import { procedure, protectedProcedure, router } from '$src/backend/trpc';
import { db } from '@packages/db';
import { z } from 'zod';

const NotifyOnSchema = z.object({
    notifyOnOpen: z.boolean(),
    notifyOnWaitlist: z.boolean(),
    notifyOnFull: z.boolean(),
    notifyOnRestriction: z.boolean(),
});

const NotificationSchema = z.object({
    term: z.string(),
    sectionCode: z.string(),
    courseTitle: z.string(),
    sectionType: z.string(),
    lastUpdatedStatus: z.string(),
    lastCodes: z.string(),
    notifyOn: NotifyOnSchema,
});

const notificationsRouter = router({
    get: protectedProcedure.query(async ({ ctx }) => {
        return await RDS.retrieveNotifications(db, ctx.userId);
    }),

    set: protectedProcedure
        .input(z.object({ notifications: z.array(NotificationSchema) }))
        .mutation(async ({ input, ctx }) => {
            const stage = process.env.STAGE?.trim() || '';
            await Promise.all(
                input.notifications.map((notification) => RDS.upsertNotification(db, ctx.userId, notification, stage))
            );
        }),

    updateNotifications: procedure.input(z.object({ notification: NotificationSchema })).mutation(async ({ input }) => {
        await RDS.updateAllNotifications(db, input.notification);
    }),

    // Intentionally public: used by unauthenticated unsubscribe links
    deleteNotification: procedure
        .input(z.object({ userId: z.string(), notification: NotificationSchema }))
        .mutation(async ({ input }) => {
            await RDS.deleteNotification(db, input.notification, input.userId);
        }),

    // Intentionally public: used by unauthenticated unsubscribe links
    deleteAllNotifications: procedure.input(z.object({ userId: z.string() })).mutation(async ({ input }) => {
        await RDS.deleteAllNotifications(db, input.userId);
    }),
});

export default notificationsRouter;
