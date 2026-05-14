import { Quarter, WebsocSectionType } from '@packages/anteater-api/types';
import { z } from 'zod';

import { RepeatingCustomEvent, RepeatingCustomEventSchema } from './customEvent';
import { AASection } from './websoc';

/** Max length for schedule notes (UI and server validation). */
export const SCHEDULE_NOTE_MAX_LENGTH = 5000;

export type TermShortName = `${string} ${Quarter}`;

export type ScheduleCourse = {
    courseComment: string;
    courseNumber: string;
    courseTitle: string;
    deptCode: string;
    prerequisiteLink: string;
    section: AASection;
    term: TermShortName;
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
export type ShortCourse = Omit<z.infer<typeof ShortCourseSchema>, 'term'> & { term: TermShortName };

export const ShortCourseScheduleSchema = z
    .object({
        scheduleName: z.string(),
        courses: z.array(ShortCourseSchema),
        customEvents: z.array(RepeatingCustomEventSchema),
        scheduleNote: z.string().max(SCHEDULE_NOTE_MAX_LENGTH).optional(),
        id: z.string().optional(),
    })
    .transform((schedule) => ({ scheduleNote: '', ...schedule }));
export type ShortCourseSchedule = Omit<z.infer<typeof ShortCourseScheduleSchema>, 'courses'> & {
    courses: ShortCourse[];
};

export const ScheduleSaveStateSchema = z.object({
    schedules: z.array(ShortCourseScheduleSchema),
    scheduleIndex: z.number(),
});
export type ScheduleSaveState = Omit<z.infer<typeof ScheduleSaveStateSchema>, 'schedules'> & {
    schedules: ShortCourseSchedule[];
};

export type ScheduleUndoState = {
    schedules: Schedule[];
    scheduleIndex: number;
};
