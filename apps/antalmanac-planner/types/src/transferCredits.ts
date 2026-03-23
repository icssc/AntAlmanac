import { z } from 'zod';
import { operations } from './generated/anteater-api-types';
import { ALL_GE_NAMES } from './courseRequirements';

export type APExam = operations['apExams']['responses'][200]['content']['application/json']['data'][number];

// These type names are prefixed with zod so as not to conflict with the db table names
// (e.g. `transferredCourse` from `db/schema`)
export const zodTransferredCourse = z.object({
  courseName: z.string(),
  units: z.number(),
});
export type TransferredCourse = z.infer<typeof zodTransferredCourse>;

export const zodTransferredAPExam = z.object({
  examName: z.string(),
  score: z.number(),
  units: z.number(),
});
export type TransferredAPExam = z.infer<typeof zodTransferredAPExam>;

export const zodSelectedApReward = z.object({
  examName: z.string(),
  path: z.string(),
  selectedIndex: z.number(),
});
export type SelectedApReward = z.infer<typeof zodSelectedApReward>;

export const zodTransferredGE = z.object({
  geName: z.enum(ALL_GE_NAMES),
  numberOfCourses: z.number(),
  units: z.number(),
});
export type TransferredGE = z.infer<typeof zodTransferredGE>;

export const zodTransferredUncategorized = z.object({
  name: z.string().nullable(),
  units: z.number().nullable(),
});
export type TransferredUncategorized = z.infer<typeof zodTransferredUncategorized>;
