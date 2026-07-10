import { describe, expect, it } from 'vitest';

import { getFiltersHint } from './search';

describe('getFiltersHint', () => {
    it('returns no hint when the filters are not dimmed', () => {
        expect(getFiltersHint(false, true)).toBeUndefined();
        expect(getFiltersHint(false, false)).toBeUndefined();
    });

    it('explains filters are course-only when course results exist', () => {
        expect(getFiltersHint(true, true)).toBe('Filters apply to course results only.');
    });

    it('explains the empty-course fallback when no courses match', () => {
        expect(getFiltersHint(true, false)).toBe('No matching courses; showing instructors.');
    });
});
