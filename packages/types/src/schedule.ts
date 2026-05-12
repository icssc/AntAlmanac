import { WebsocSectionType } from '@packages/anteater-api-types';
import { z } from 'zod';

import { RepeatingCustomEvent, RepeatingCustomEventSchema } from './customEvent';
import { AASection } from './websoc';

/** Max length for schedule notes (UI and server validation). */
export const SCHEDULE_NOTE_MAX_LENGTH = 5000;

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

export type VisibilityState = 'visible' | 'outlined' | 'disappeared';

export const ShortCourseSchema = z.object({
    color: z.string(),
    term: z.string(),
    sectionCode: z.string(),
    visibility: z.enum(['visible', 'outlined', 'disappeared']),
});
export type ShortCourse = z.infer<typeof ShortCourseSchema>;

const ShortCourseScheduleFieldsSchema = z.object({
    scheduleName: z.string(),
    courses: z.array(ShortCourseSchema),
    customEvents: z.array(RepeatingCustomEventSchema),
    scheduleNote: z.string().max(SCHEDULE_NOTE_MAX_LENGTH).optional(),
    id: z.string().optional(),
});

export const ShortCourseScheduleSchema = ShortCourseScheduleFieldsSchema.transform((schedule) => ({
    scheduleNote: '',
    ...schedule,
}));
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
