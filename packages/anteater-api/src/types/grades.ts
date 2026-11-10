import type {
    AggregateGradesByOfferingResponse,
    AggregateGradesResponse,
    RawGradesData,
    RawGradesResponse,
} from './generated/anteater-api-types';

export type GE = NonNullable<NonNullable<RawGradesData['query']>['ge']>;

export type AggregateGradesAPIResult = AggregateGradesResponse;

export type AggregateGrades = AggregateGradesAPIResult['data'];

export type AggregateGradesByOfferingAPIResult = AggregateGradesByOfferingResponse;

export type AggregateGradesByOffering = AggregateGradesByOfferingAPIResult['data'];

export type GradesRaw = RawGradesResponse['data'];
