import type {
    AggregateGradesByOfferingResponse,
    AggregateGradesResponse,
    RawGradesData,
} from '$generated/anteater-api-types';

export type GE = NonNullable<NonNullable<RawGradesData['query']>['ge']>;

export type AggregateGradesAPIResult = AggregateGradesResponse;

export type AggregateGrades = AggregateGradesAPIResult['data'];

export type GradeDistribution = AggregateGrades['gradeDistribution'];

export type AggregateGradesByOfferingAPIResult = AggregateGradesByOfferingResponse;

export type AggregateGradesByOffering = AggregateGradesByOfferingAPIResult['data'];

export type AggregateGradesByCourseAPIResult =
    paths['/v2/rest/grades/aggregateByCourse']['get']['responses']['200']['content']['application/json'];

type AggregateGradesByCourse = AggregateGradesByCourseAPIResult['data'];

export type CourseGradeDistribution = AggregateGradesByCourse[number];