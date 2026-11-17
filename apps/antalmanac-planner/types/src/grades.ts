import { paths } from './generated/anteater-api-types';

export type GradesRaw = paths['/v2/rest/grades/raw']['get']['responses'][200]['content']['application/json']['data'];

/** Grades pre-aggregated per instructor offering: averageGPA + grade counts. */
export type AggregateGradesByOffering =
    paths['/v2/rest/grades/aggregateByOffering']['get']['responses'][200]['content']['application/json']['data'][number];
