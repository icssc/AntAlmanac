import { type, arrayOf } from "arktype";
import { RepeatingCustomEventSchema } from "./customevent.types";
import { AASection } from "./websoc";

export const ScheduleCourseSchema = type({
    courseComment: "string",
    courseNumber: "string",
    courseTitle: "string",
    deptCode: "string",
    prerequisiteLink: "string",
    section: AASection,
    term: "string",
});
export type ScheduleCourse = typeof ScheduleCourseSchema.infer;

export const ScheduleSchema = type({
    scheduleName: "string",
    courses: arrayOf(ScheduleCourseSchema),
    customEvents: arrayOf(RepeatingCustomEventSchema),
    scheduleNoteId: "number",
});
export type Schedule = typeof ScheduleSchema.infer;

export const ShortCourseSchema = type({
    color: "string",
    term: "string",
    sectionCode: "string",
});
export type ShortCourse = typeof ShortCourseSchema.infer;

export const ShortCourseScheduleSchema = type([{
    scheduleName: "string",
    courses: arrayOf(ShortCourseSchema),
    customEvents: arrayOf(RepeatingCustomEventSchema),
    "scheduleNote?": "string",
}, '|>', (s) => ({scheduleNote: '', ...s})]  );
export type ShortCourseSchedule = typeof ShortCourseScheduleSchema.infer;

export const ScheduleSaveStateSchema = type({
    schedules: arrayOf(ShortCourseScheduleSchema),
    scheduleIndex: "number",
});
export type ScheduleSaveState = typeof ScheduleSaveStateSchema.infer;

export const ScheduleUndoStateSchema = type({
    schedules: arrayOf(ScheduleSchema),
    scheduleIndex: "number",
});
export type ScheduleUndoState = typeof ScheduleUndoStateSchema.infer;


