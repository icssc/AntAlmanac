import { z } from 'zod';

export const reportSubmission = z.object({
  reviewId: z.number(),
  reason: z.string().min(1).max(500),
});
export type ReportSubmission = z.infer<typeof reportSubmission>;

export const reportData = reportSubmission.extend({
  id: z.number(),
  createdAt: z.string(),
});
export type ReportData = z.infer<typeof reportData>;

export interface ReportGroupData {
  reviewId: number;
  reports: ReportData[];
}
