import type { paths } from './generated/anteater-api-types';

export type GE = NonNullable<NonNullable<paths['/v2/rest/grades/raw']['get']['parameters']['query']>['ge']>;

export type AggregateGradesAPIResult =
    paths['/v2/rest/grades/aggregate']['get']['responses']['200']['content']['application/json'];

export type AggregateGrades = AggregateGradesAPIResult['data'];

export type GradeDistribution = AggregateGrades['gradeDistribution'];

export type AggregateGradesByCourseAPIResult =
    paths['/v2/rest/grades/aggregateByCourse']['get']['responses']['200']['content']['application/json'];

export type AggregateGradesByCourse = AggregateGradesByCourseAPIResult['data'];

export type AggregateGradesByOfferingAPIResult =
    paths['/v2/rest/grades/aggregateByOffering']['get']['responses']['200']['content']['application/json'];

export type AggregateGradesByOffering = AggregateGradesByOfferingAPIResult['data'];
