import { type, arrayOf } from 'arktype';
import { RepeatingCustomEventSchema } from './customevent';
import { AASectionSchema } from './websoc';
import { TermNamesSchema } from './terms';

export const ScheduleCourseSchema = type({
    courseComment: 'string',
    courseNumber: 'string',
    courseTitle: 'string',
    deptCode: 'string',
    prerequisiteLink: 'string',
    section: AASectionSchema,
    term: TermNamesSchema,
});
export type ScheduleCourse = typeof ScheduleCourseSchema.infer;

export const ScheduleSchema = type({
    scheduleName: 'string',
    term: TermNamesSchema,
    courses: arrayOf(ScheduleCourseSchema),
    customEvents: arrayOf(RepeatingCustomEventSchema),
    scheduleNoteId: 'number',
});
export type Schedule = typeof ScheduleSchema.infer;

export const ShortCourseSchema = type({
    color: 'string',
    term: TermNamesSchema,
    sectionCode: 'string',
});
export type ShortCourse = typeof ShortCourseSchema.infer;

export const ShortCourseScheduleSchema = type([
    {
        scheduleName: 'string',
        'term?': TermNamesSchema,
        courses: arrayOf(ShortCourseSchema),
        customEvents: arrayOf(RepeatingCustomEventSchema),
        'scheduleNote?': 'string',
    },
    '|>',
    (s) => ({ scheduleNote: '', ...s }),
]);
export type ShortCourseSchedule = typeof ShortCourseScheduleSchema.infer;

export const ScheduleSaveStateSchema = type({
    schedules: arrayOf(ShortCourseScheduleSchema),
    scheduleIndex: 'number',
});
export type ScheduleSaveState = typeof ScheduleSaveStateSchema.infer;

export const ScheduleUndoStateSchema = type({
    schedules: arrayOf(ScheduleSchema),
    scheduleIndex: 'number',
});
export type ScheduleUndoState = typeof ScheduleUndoStateSchema.infer;
