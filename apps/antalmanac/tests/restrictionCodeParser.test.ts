import { parseAsExcludeRestrictionCodes } from '$components/RightPane/CoursePane/SearchParams/restrictionCodeParser';
import { describe, expect, it } from 'vitest';

describe('parseAsExcludeRestrictionCodes', () => {
    it('parses comma-separated codes', () => {
        expect(parseAsExcludeRestrictionCodes.parse('A,E')).toEqual(['A', 'E']);
    });

    it('parses legacy concatenated codes', () => {
        expect(parseAsExcludeRestrictionCodes.parse('AE')).toEqual(['A', 'E']);
    });

    it('serializes as comma-separated codes', () => {
        expect(parseAsExcludeRestrictionCodes.serialize(['A', 'E'])).toBe('A,E');
    });

    it('drops invalid legacy characters', () => {
        expect(parseAsExcludeRestrictionCodes.parse('A?E')).toEqual(['A', 'E']);
    });
});
