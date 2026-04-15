import { z } from 'zod';

export const quarters = ['Fall', 'Winter', 'Spring', 'Summer1', 'Summer10wk', 'Summer2'] as const;

export const quarterName = z.enum(quarters);
export type QuarterName = z.infer<typeof quarterName>;

export const savedPlannerQuarterData = z.object({
  name: quarterName,
  courses: z.array(z.string()),
});
export type SavedPlannerQuarterData = z.infer<typeof savedPlannerQuarterData>;

export const savedPlannerYearData = z.object({
  startYear: z.number(),
  name: z.string().max(35),
  quarters: z.array(savedPlannerQuarterData),
});
export type SavedPlannerYearData = z.infer<typeof savedPlannerYearData>;

export const savedPlannerData = z.object({
  id: z.number(),
  name: z.string().max(35),
  content: z.array(savedPlannerYearData),
  chc: z.enum(['', 'CHC4', 'CHC2']).optional(),
});
export type SavedPlannerData = z.infer<typeof savedPlannerData>;

// Specify name of transfer course and how many units its worth
export const legacyTransfer = z.object({
  name: z.string(),
  units: z.number().nullish(),
});
export type LegacyTransfer = z.infer<typeof legacyTransfer>;

/*
  An extended version of TransferData
  that optionally allows for a score (for AP exams from Zot4Plan)
*/
export const extendedTransferData = z.object({
  name: z.string(),
  units: z.number().nullish(),
  score: z.number().nullish(),
});
export type ExtendedTransferData = z.infer<typeof extendedTransferData>;

// Bundle planner and transfer data in one object
export const savedRoadmap = z.object({
  planners: z.array(savedPlannerData),
  transfers: z.array(legacyTransfer).optional().describe('Used for legacy transfers only'),
  timestamp: z.string().optional(),
  currentPlanIndex: z.number().optional(),
});

export type SavedRoadmap = z.infer<typeof savedRoadmap>;

export interface LegacyRoadmap {
  planner: SavedPlannerYearData[];
  transfers: LegacyTransfer[];
  timestamp?: string;
  currentPlanIndex?: number;
}

// Roadmap Diffs
const plannerChangeIdentifier = z.object({
  id: z.number(),
});

const plannerYearChangeIdentifier = z.object({
  id: z.number(),
  plannerId: z.number().int(),
});

const plannerQuarterChangeIdentifier = z.object({
  id: z.string(),
  plannerId: z.number().int(),
  startYear: z.number().int(),
});

export type PlannerDeletion = z.infer<typeof plannerChangeIdentifier>;
export type PlannerYearDeletion = z.infer<typeof plannerYearChangeIdentifier>;
export type PlannerQuarterDeletion = z.infer<typeof plannerQuarterChangeIdentifier>;
export type RoadmapItemDeletion = PlannerDeletion | PlannerYearDeletion | PlannerQuarterDeletion;

const roadmapPlannerChange = z.object({
  data: z.object({ id: z.number().int(), name: z.string().max(35) }),
});

const plannerYearSaveInfo = plannerYearChangeIdentifier.omit({ id: true }).extend({
  data: z.object({ startYear: z.number().int(), name: z.string().max(35) }),
});

const plannerQuarterSaveInfo = plannerQuarterChangeIdentifier.omit({ id: true }).extend({
  data: z.object({ name: z.string().max(35), courses: z.array(z.string()) }),
});

export type PlannerSaveInfo = z.infer<typeof roadmapPlannerChange>;
export type PlannerYearSaveInfo = z.infer<typeof plannerYearSaveInfo>;
export type PlannerQuarterSaveInfo = z.infer<typeof plannerQuarterSaveInfo>;
export type RoadmapSaveInfo = PlannerSaveInfo | PlannerYearSaveInfo | PlannerQuarterSaveInfo;

const plannerQuarterDiffs = z.object({
  updatedQuarters: z.array(plannerQuarterSaveInfo),
});

const plannerYearDiffs = plannerQuarterDiffs.extend({
  deletedQuarters: z.array(plannerQuarterChangeIdentifier),
  newQuarters: z.array(plannerQuarterSaveInfo),
  updatedYears: z.array(plannerYearSaveInfo),
});

const plannerDiffs = plannerYearDiffs.extend({
  deletedYears: z.array(plannerYearChangeIdentifier),
  newYears: z.array(plannerYearSaveInfo),
  updatedPlanners: z.array(roadmapPlannerChange),
});

export const roadmapDiffs = plannerDiffs.extend({
  deletedPlanners: z.array(plannerChangeIdentifier),
  newPlanners: z.array(roadmapPlannerChange),
  overwrite: z.boolean().optional(),
  currentPlanIndex: z.number().optional(),
});

export type PlannerQuarterDiffs = z.infer<typeof plannerQuarterDiffs>;
export type PlannerYearDiffs = z.infer<typeof plannerYearDiffs>;
export type PlannerDiffs = z.infer<typeof plannerDiffs>;
export type RoadmapDiffs = z.infer<typeof roadmapDiffs>;
