import {
    deleteAllNotifications,
    deleteNotification,
    retrieveNotifications,
    updateAllNotifications,
    upsertNotification,
} from '$src/backend/lib/rds/notifications';
import { procedure, protectedProcedure, router } from '$src/backend/trpc';
import { QuarterSchema, WebsocSectionStatusSchema, WebsocSectionTypeSchema } from '@packages/antalmanac-types';
import { db } from '@packages/db';
import { z } from 'zod';

const NotifyOnSchema = z.object({
    notifyOnOpen: z.boolean(),
    notifyOnWaitlist: z.boolean(),
    notifyOnFull: z.boolean(),
    notifyOnRestriction: z.boolean(),
});

const NotificationSchema = z.object({
    year: z.string(),
    quarter: QuarterSchema,
    sectionCode: z.string(),
    courseTitle: z.string(),
    sectionType: WebsocSectionTypeSchema,
    lastUpdatedStatus: WebsocSectionStatusSchema.nullable(),
    lastCodes: z.string(),
    notifyOn: NotifyOnSchema,
});

const getStage = () => process.env.STAGE?.trim() || 'production';

const notificationsRouter = router({
    get: protectedProcedure.query(async ({ ctx }) => {
        const stage = getStage();
        return await retrieveNotifications(db, ctx.userId, stage);
    }),

    set: protectedProcedure
        .input(z.object({ notifications: z.array(NotificationSchema) }))
        .mutation(async ({ input, ctx }) => {
            const stage = getStage();
            await Promise.all(
                input.notifications.map((notification) => upsertNotification(db, ctx.userId, notification, stage))
            );
        }),

    updateNotifications: procedure.input(z.object({ notification: NotificationSchema })).mutation(async ({ input }) => {
        const stage = getStage();
        await updateAllNotifications(db, input.notification, stage);
    }),

    // Intentionally public: used by unauthenticated unsubscribe links
    deleteNotification: procedure
        .input(
            z.object({
                userId: z.string(),
                sectionCode: z.string(),
                year: z.string(),
                quarter: QuarterSchema,
            })
        )
        .mutation(async ({ input }) => {
            const stage = getStage();
            await deleteNotification(db, input.userId, input.sectionCode, input.year, input.quarter, stage);
        }),

    // Intentionally public: used by unauthenticated unsubscribe links
    deleteAllNotifications: procedure.input(z.object({ userId: z.string() })).mutation(async ({ input }) => {
        const stage = getStage();
        await deleteAllNotifications(db, input.userId, stage);
    }),
});

export default notificationsRouter;
