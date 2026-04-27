import { z } from 'zod';

export const LegacyCourseSchema = z.object({
    color: z.string(),
    term: z.string(),
    sectionCode: z.string(),
    scheduleIndices: z.array(z.number()),
});

export const LegacyCustomEventSchema = z.object({
    customEventID: z.string(),
    color: z.string(),
    title: z.string(),
    days: z.array(z.boolean()),
    scheduleIndices: z.array(z.number()),
    start: z.string(),
    end: z.string(),
});

export const LegacyUserDataSchema = z.object({
    addedCourses: z.array(LegacyCourseSchema),
    scheduleNames: z.array(z.string()),
    customEvents: z.array(LegacyCustomEventSchema),
});

export const LegacyUserSchema = z.object({
    _id: z.string(),
    userData: LegacyUserDataSchema,
});

export type LegacyUserData = z.infer<typeof LegacyUserDataSchema>;
export type LegacyUser = z.infer<typeof LegacyUserSchema>;
