import { type, arrayOf } from 'arktype';
import { RepeatingCustomEvent, RepeatingCustomEventSchema } from './customevent';
import { AASection } from './websoc';
import { WebsocSectionType } from '@packages/anteater-api-types';

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
};

export const ShortCourseSchema = type({
    color: 'string',
    term: 'string',
    sectionCode: 'string',
});
export type ShortCourse = typeof ShortCourseSchema.infer;

export const ShortCourseScheduleSchema = type([
    {
        scheduleName: 'string',
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

export type ScheduleUndoState = {
    schedules: Schedule[];
    scheduleIndex: number;
};
