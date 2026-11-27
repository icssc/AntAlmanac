import type {
    AggregateGradesByCourseResponse,
    AggregateGradesByOfferingResponse,
    AggregateGradesResponse,
    RawGradesData,
    RawGradesResponse,
} from './generated/anteater-api-types';

export type GE = NonNullable<NonNullable<RawGradesData['query']>['ge']>;

export type AggregateGradesAPIResult = AggregateGradesResponse;

export type AggregateGrades = AggregateGradesAPIResult['data'];

export type GradeDistribution = AggregateGrades['gradeDistribution'];

export type AggregateGradesByOfferingAPIResult = AggregateGradesByOfferingResponse;

export type AggregateGradesByOffering = AggregateGradesByOfferingAPIResult['data'];

export type AggregateGradesByCourseAPIResult = AggregateGradesByCourseResponse;

type AggregateGradesByCourse = AggregateGradesByCourseAPIResult['data'];

export type CourseGradeDistribution = AggregateGradesByCourse[number];

export type GradesRaw = RawGradesResponse['data'];
