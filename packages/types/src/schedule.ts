import { WebsocSectionType } from '@packages/anteater-api-types';
import { z } from 'zod';

import { RepeatingCustomEvent, RepeatingCustomEventSchema } from './customevent';
import { AASection } from './websoc';

export type ScheduleCourse = {
    courseComment: string;
    courseNumber: string;
    courseTitle: string;
    deptCode: string;
    prerequisiteLink: string;
    section: AASection;
    term: string;
    sectionTypes: WebsocSectionType[];
};

export type Schedule = {
    scheduleName: string;
    courses: ScheduleCourse[];
    customEvents: RepeatingCustomEvent[];
    scheduleNoteId: number;
    scheduleId: string;
};

export const ShortCourseSchema = z.object({
    color: z.string(),
    term: z.string(),
    sectionCode: z.string(),
});
export type ShortCourse = z.infer<typeof ShortCourseSchema>;

export const ShortCourseScheduleSchema = z
    .object({
        scheduleName: z.string(),
        courses: z.array(ShortCourseSchema),
        customEvents: z.array(RepeatingCustomEventSchema),
        scheduleNote: z.string().optional(),
        id: z.string().optional(),
    })
    .transform((schedule) => ({ scheduleNote: '', ...schedule }));
export type ShortCourseSchedule = z.infer<typeof ShortCourseScheduleSchema>;

export const ScheduleSaveStateSchema = z.object({
    schedules: z.array(ShortCourseScheduleSchema),
    scheduleIndex: z.number(),
});
export type ScheduleSaveState = z.infer<typeof ScheduleSaveStateSchema>;

export type ScheduleUndoState = {
    schedules: Schedule[];
    scheduleIndex: number;
};
