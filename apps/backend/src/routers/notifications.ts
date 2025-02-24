import { z } from 'zod';
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
    notificationStatus: NotificationStatusSchema,
});

const notificationsRouter = router({
    get: procedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
        return {
            '34040 2025 Spring': {
                term: '2025 Spring',
                courseTitle: 'foo boo',
                sectionCode: '34040',
                notificationStatus: {
                    openStatus: true,
                    waitlistStatus: false,
                    fullStatus: false,
                    restrictionStatus: false,
                },
            },
            '34041 2025 Spring': {
                term: '2025 Spring',
                courseTitle: 'foo foo',
                sectionCode: '34041',
                notificationStatus: {
                    openStatus: true,
                    waitlistStatus: false,
                    fullStatus: false,
                    restrictionStatus: false,
                },
            },
            '34130 2025 Spring': {
                term: '2025 Spring',
                courseTitle: 'foo foo',
                sectionCode: '34130',
                notificationStatus: {
                    openStatus: true,
                    waitlistStatus: false,
                    fullStatus: false,
                    restrictionStatus: false,
                },
            },
            '34131 2025 Spring': {
                term: '2025 Spring',
                courseTitle: 'foo foo',
                sectionCode: '34131',
                notificationStatus: {
                    openStatus: true,
                    waitlistStatus: false,
                    fullStatus: false,
                    restrictionStatus: false,
                },
            },
            '34132 2025 Spring': {
                term: '2025 Spring',
                courseTitle: 'foo foo',
                sectionCode: '34132',
                notificationStatus: {
                    openStatus: true,
                    waitlistStatus: false,
                    fullStatus: false,
                    restrictionStatus: false,
                },
            },
            '34133 2025 Spring': {
                term: '2025 Spring',
                courseTitle: 'foo foo',
                sectionCode: '34133',
                notificationStatus: {
                    openStatus: true,
                    waitlistStatus: false,
                    fullStatus: false,
                    restrictionStatus: false,
                },
            },
            '34134 2025 Spring': {
                term: '2025 Spring',
                courseTitle: 'foo foo',
                sectionCode: '34134',
                notificationStatus: {
                    openStatus: true,
                    waitlistStatus: false,
                    fullStatus: false,
                    restrictionStatus: false,
                },
            },
            '34135 2025 Spring': {
                term: '2025 Spring',
                courseTitle: 'foo foo',
                sectionCode: '34135',
                notificationStatus: {
                    openStatus: true,
                    waitlistStatus: false,
                    fullStatus: false,
                    restrictionStatus: false,
                },
            },
            '34136 2025 Spring': {
                term: '2025 Spring',
                courseTitle: 'foo foo',
                sectionCode: '34136',
                notificationStatus: {
                    openStatus: true,
                    waitlistStatus: false,
                    fullStatus: false,
                    restrictionStatus: false,
                },
            },
            '34137 2025 Spring': {
                term: '2025 Spring',
                courseTitle: 'foo foo',
                sectionCode: '34137',
                notificationStatus: {
                    openStatus: true,
                    waitlistStatus: false,
                    fullStatus: false,
                    restrictionStatus: false,
                },
            },
            '34020 2025 Spring': {
                term: '2025 Spring',
                courseTitle: 'foo foo',
                sectionCode: '34020',
                notificationStatus: {
                    openStatus: true,
                    waitlistStatus: false,
                    fullStatus: false,
                    restrictionStatus: false,
                },
            },
        };

        // return await RDS
    }),

    set: procedure
        .input(z.object({ id: z.string(), notifications: z.array(NotificationSchema) }))
        .mutation(async ({ input }) => {
            const { id, notifications } = input;

            // return await RDS
        }),
});

export default notificationsRouter;
