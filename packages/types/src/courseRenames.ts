/**
 * A single course rename event.
 *
 * `effectiveYear` is the fall-start year of the academic year in which the
 * course was first offered under its new name.  For example, if DEPT 101 was
 * first offered as NEW 101 in Fall 2024, use `effectiveYear: 2024`.
 *
 * Data recorded before `effectiveYear` in AnteaterAPI lives under `previously`,
 * and data from `effectiveYear` onward lives under the current course ID — so
 * there is no overlap and fetching both is purely additive.
 *
 * Chains (a → b → c) are represented as a linked list: each step is its own
 * entry where `previously` points to the immediately preceding course ID.
 * Example for a → b (2022) → c (2025):
 *   'b': { previously: 'a', effectiveYear: 2022 }
 *   'c': { previously: 'b', effectiveYear: 2025 }
 * The utility `getPredecessorIds('c')` will walk the chain and return ['b', 'a'].
 */
export interface CourseRenameEntry {
    /** The course ID that was used immediately before the current name. */
    previously: string;
    /**
     * The fall-start year of the academic year in which this course was first
     * offered under its current name.
     */
    effectiveYear: number;
}

/**
 * Maps a current course ID to its rename metadata.
 *
 * Course IDs follow the AnteaterAPI convention: `"${DEPT} ${NUMBER}"`,
 * e.g. `"SWE 43"` or `"ICS H32"`.
 *
 * To add a rename:
 *   1. Add one entry whose key is the *new* course ID.
 *   2. Set `previously` to the *old* course ID.
 *   3. Set `effectiveYear` to the fall-start year of the academic year the
 *      new name first appeared.
 *
 * For a chain (old → mid → new), add two entries:
 *   'mid': { previously: 'old', effectiveYear: <year1> }
 *   'new': { previously: 'mid', effectiveYear: <year2> }
 */
export const COURSE_RENAMES: Record<string, CourseRenameEntry> = {
    // INF 43 → SWE 43 (Fall 2024)
    'SWE 43': { previously: 'INF 43', effectiveYear: 2024 },
    // ICS 32A → ICS H32 (Fall 2024)
    'ICS H32': { previously: 'ICS 32A', effectiveYear: 2024 },
};
