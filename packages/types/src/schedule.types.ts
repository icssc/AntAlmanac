// import {arrayOf, scope} from "arktype";
// import { RepeatingCustomEventSchema } from "./customevent.types";
// import { AASection } from "./websoc";
//
// export const types = scope({
//     scheduleCourse: {
//         courseComment: "string",
//         courseNumber: "string",
//         courseTitle: "string",
//         deptCode: "string",
//         prerequisiteLink: "string",
//         section: AASection,
//         term: "string",
//     },
//     schedule: {
//         scheduleName: "string",
//         courses: "scheduleCourse[]",
//         customEvents: arrayOf(RepeatingCustomEventSchema),
//         scheduleNoteId: "number",
//     },
//     shortCourse: {
//         color: "string",
//         term: "string",
//         sectionCode: "string",
//     },
//     shortCourseSchedule: {
//         scheduleName: "string",
//         courses: "shortCourse[]",
//         customEvents: arrayOf(RepeatingCustomEventSchema),
//         scheduleNote: "string",
//     },
//     scheduleSaveState: {
//         schedules: "shortCourseSchedule[]",
//         scheduleIndex: "number",
//     },
//     scheduleUndoState: {
//         schedules: "schedule[]",
//         scheduleIndex: "number",
//     },
// }).compile();
//
// export const ScheduleSaveStateSchema = types.scheduleSaveState
// export type ScheduleSaveState = typeof types.scheduleSaveState.infer

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

export const ShortCourseScheduleSchema = type({
    scheduleName: "string",
    courses: arrayOf(ShortCourseSchema),
    customEvents: arrayOf(RepeatingCustomEventSchema),
    scheduleNote: "string",
});
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


