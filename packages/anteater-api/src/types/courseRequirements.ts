import type {
    CourseByIdResponse,
    GetMajorsResponse,
    GetMinorsResponse,
    GetSpecializationsResponse,
    ProgramRequirement as ProgramRequirementRaw,
    RawGradesResponse,
} from '$generated/anteater-api-types';

export type GEName = RawGradesResponse['data'][number]['geCategories'][number];

export type GETitle = CourseByIdResponse['data']['geList'][number];

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

export type MajorProgram = GetMajorsResponse['data'][0];
export type MinorProgram = GetMinorsResponse['data'][0];
export type MajorSpecialization = GetSpecializationsResponse['data'][0];

type RequirementSchema = ProgramRequirementRaw;
type ReqType = RequirementSchema['requirementType'];
export type ProgramRequirement<T extends ReqType = ReqType> = RequirementSchema & { requirementType: T };

export interface SavedMajorProgram {
    majorId: string;
    specializationId?: string;
    catalogYear?: string;
}

export interface SavedMinorProgram {
    id: string;
    name: string;
    catalogYear?: string;
}
