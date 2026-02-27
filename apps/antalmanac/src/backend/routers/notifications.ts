import { db } from '@packages/db/src/index';
import { z } from 'zod';

import { RDS } from '../../backend/lib/rds';
import { procedure, router } from '../trpc';

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

const getStage = () => process.env.STAGE?.trim() || 'production';

const notificationsRouter = router({
    get: procedure.input(z.object({ userId: z.string() })).query(async ({ input }) => {
        const stage = getStage();
        return await RDS.retrieveNotifications(db, input.userId, stage);
    }),

    set: procedure
        .input(z.object({ userId: z.string(), notifications: z.array(NotificationSchema) }))
        .mutation(async ({ input }) => {
            const stage = getStage();
            await Promise.all(
                input.notifications.map((notification) => RDS.upsertNotification(db, input.userId, notification, stage))
            );
        }),

    updateNotifications: procedure.input(z.object({ notification: NotificationSchema })).mutation(async ({ input }) => {
        const stage = getStage();
        await RDS.updateAllNotifications(db, input.notification, stage);
    }),

    deleteNotification: procedure
        .input(z.object({ userId: z.string(), notification: NotificationSchema }))
        .mutation(async ({ input }) => {
            const stage = getStage();
            await RDS.deleteNotification(db, input.notification, input.userId, stage);
        }),

    deleteAllNotifications: procedure.input(z.object({ userId: z.string() })).mutation(async ({ input }) => {
        const stage = getStage();
        await RDS.deleteAllNotifications(db, input.userId, stage);
    }),
});

export default notificationsRouter;
