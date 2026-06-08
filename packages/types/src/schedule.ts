import type { WebsocSectionType } from '@packages/anteater-api/types';
import { z } from 'zod';

import type { AATerm } from './calendar';
import type { AASection } from './course';
import { RepeatingCustomEventSchema, type RepeatingCustomEvent } from './customEvent';

/** Max length for schedule notes (UI and server validation). */
export const SCHEDULE_NOTE_MAX_LENGTH = 5000;

export type ScheduleCourse = {
    courseId: string;
    courseComment: string;
    courseNumber: string;
    courseTitle: string;
    deptCode: string;
    prerequisiteLink: string;
    section: AASection;
    term: AATerm;
    sectionTypes: WebsocSectionType[];
};

export type Schedule = {
    /**
     * Optional unique identifier for the schedule.
     * Present when schedules are loaded from the backend.
     */
    id?: string;
    scheduleName: string;
    courses: ScheduleCourse[];
    customEvents: RepeatingCustomEvent[];
    scheduleNoteId: number;
    scheduleId: string;
};

export enum VisibilityState {
    Visible = 'visible',
    Outlined = 'outlined',
    Disappeared = 'disappeared',
}

export const VISIBILITY_STATES = Object.values(VisibilityState) as [VisibilityState, ...VisibilityState[]];

export const ShortCourseSchema = z.object({
    color: z.string(),
    term: z.string(),
    sectionCode: z.string(),
    visibility: z.enum(VISIBILITY_STATES).optional().default(VisibilityState.Visible),
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
