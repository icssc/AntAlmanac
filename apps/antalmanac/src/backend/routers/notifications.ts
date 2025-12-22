import { z } from 'zod';
import { db } from '@packages/db/src/index';
import { RDS } from '../../backend/lib/rds';
import { procedure, router } from '../trpc';

const NotificationStatusSchema = z.object({
    openStatus: z.boolean(),
    waitlistStatus: z.boolean(),
    fullStatus: z.boolean(),
    restrictionStatus: z.boolean(),
});

const NotificationSchema = z.object({
    term: z.string(),
    sectionCode: z.string(),
    courseTitle: z.string(),
    sectionType: z.string(),
    lastUpdatedStatus: z.string(),
    lastCodes: z.string(),
    notificationStatus: NotificationStatusSchema,
});

const notificationsRouter = router({
    get: procedure.input(z.object({ userId: z.string() })).query(async ({ input }) => {
        return await RDS.retrieveNotifications(db, input.userId);
    }),

    set: procedure
        .input(z.object({ userId: z.string(), notifications: z.array(NotificationSchema) }))
        .mutation(async ({ input }) => {
            await Promise.all(
                input.notifications.map((notification) => RDS.upsertNotification(db, input.userId, notification))
            );
        }),

    updateNotifications: procedure.input(z.object({ notification: NotificationSchema })).mutation(async ({ input }) => {
        await RDS.updateAllNotifications(db, input.notification);
    }),

    deleteNotification: procedure
        .input(z.object({ userId: z.string(), notification: NotificationSchema }))
        .mutation(async ({ input }) => {
            await RDS.deleteNotification(db, input.notification, input.userId);
        }),

    deleteAllNotifications: procedure.input(z.object({ userId: z.string() })).mutation(async ({ input }) => {
        await RDS.deleteAllNotifications(db, input.userId);
    }),
});

export default notificationsRouter;
