import { components, operations } from './generated/anteater-api-types';

export type GEName =
  operations['rawGrades']['responses'][200]['content']['application/json']['data'][number]['geCategories'][number];

export type GETitle =
  operations['courseById']['responses'][200]['content']['application/json']['data']['geList'][number];

/** A list of all GE names used for transfer credits menu and by zod types */
export const ALL_GE_NAMES = [
  'GE-1A',
  'GE-1B',
  'GE-2',
  'GE-3',
  'GE-4',
  'GE-5A',
  'GE-5B',
  'GE-6',
  'GE-7',
  'GE-8',
] as const;

export type MajorProgram = operations['getMajors']['responses']['200']['content']['application/json']['data'][0];
export type MinorProgram = operations['getMinors']['responses']['200']['content']['application/json']['data'][0];
export type MajorSpecialization =
  operations['getSpecializations']['responses']['200']['content']['application/json']['data'][0];

type RequirementSchema = components['schemas']['programRequirement'];
type ReqType = RequirementSchema['requirementType'];
export type ProgramRequirement<T extends ReqType = ReqType> = RequirementSchema & { requirementType: T };

export interface MajorSpecializationPair {
  majorId: string;
  specializationId?: string;
}
