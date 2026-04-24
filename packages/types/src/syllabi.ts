/**
 * Types for the forthcoming `GET /v2/rest/websoc/syllabi` endpoint.
 * Tracks icssc/anteater-api#366. Replace these with re-exports from
 * `@packages/anteater-api-types` once the generated OpenAPI types include them.
 */

export type SyllabiQuarter = 'Fall' | 'Winter' | 'Spring' | 'Summer1' | 'Summer10wk' | 'Summer2';

export interface Syllabus {
    year: string;
    quarter: SyllabiQuarter;
    instructorNames: string[];
    url: string;
}

export interface SyllabiAPIResult {
    ok: boolean;
    data: Syllabus[];
}
