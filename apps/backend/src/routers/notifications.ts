import { z } from 'zod';
import { db } from 'src/db';
import { RDS } from 'src/lib/rds';
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
    lastUpdated: z.string(),
    lastCodes: z.string(),
    notificationStatus: NotificationStatusSchema,
});

const notificationsRouter = router({
    get: procedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
        return await RDS.retrieveNotifications(db, input.id);
    }),

    set: procedure
        .input(z.object({ id: z.string(), notifications: z.array(NotificationSchema) }))
        .mutation(async ({ input }) => {
            await Promise.all(
                input.notifications.map(notification =>
                    RDS.upsertNotification(db, input.id, notification)
                )
            );
            
        }),
    
    updateNotifications: procedure
        .input(z.object({ notification: NotificationSchema }))
        .mutation(async ({ input }) => {
            await RDS.updateAllNotifications(db, input.notification);
        }),

    deleteNotification: procedure
        .input(z.object({ id: z.string(), notification: NotificationSchema }))
        .mutation(async ({ input }) => {
            await RDS.deleteNotification(db, input.notification, input.id);
        }
    ),

    deleteAllNotifications: procedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            await RDS.deleteAllNotifications(db, input.id);
        }),
});

export default notificationsRouter;
