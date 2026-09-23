/**
 * Message shown under the filters while the instructor results are being viewed. Filters only
 * affect course results, so we explain why they don't change the visible (instructor) list, and
 * call out the common case where a filter narrowed the courses down to nothing.
 */
export function getFiltersHint(dimmed: boolean, hasCourseResults: boolean): string | undefined {
    if (!dimmed) return undefined;
    return hasCourseResults ? 'Filters apply to course results only.' : 'No matching courses; showing instructors.';
}
