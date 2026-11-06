import { getRestrictionToWarn } from '$lib/enrollmentRestrictions';
import type { School } from '@packages/antalmanac-types';
import { describe, expect, test } from 'vitest';

const ICS: School = 'Donald Bren School of Information and Computer Sciences';
const ENG: School = 'Henry Samueli School of Engineering';
const BIO: School = 'Charlie Dunlop School of Biological Sciences';

describe('getRestrictionToWarn', () => {
    describe('returns null early', () => {
        test('when userSchools is empty', () => {
            expect(getRestrictionToWarn({ restrictions: 'N', courseSchool: ICS, userSchools: [] })).toBeNull();
        });

        test('when courseSchool is missing', () => {
            expect(getRestrictionToWarn({ restrictions: 'N', courseSchool: undefined, userSchools: [ICS] })).toBeNull();
        });

        test('when courseSchool is empty string', () => {
            expect(getRestrictionToWarn({ restrictions: 'N', courseSchool: '', userSchools: [ICS] })).toBeNull();
        });
    });

    describe('N: limited to students in the school', () => {
        test('warns when user is outside the school', () => {
            expect(getRestrictionToWarn({ restrictions: 'N', courseSchool: ICS, userSchools: [ENG] })).toBe('N');
        });

        test('does not warn when user is in the school', () => {
            expect(getRestrictionToWarn({ restrictions: 'N', courseSchool: ICS, userSchools: [ICS] })).toBeNull();
        });
    });

    describe('O: not open to students in the school', () => {
        test('warns when user is in the school', () => {
            expect(getRestrictionToWarn({ restrictions: 'O', courseSchool: ICS, userSchools: [ICS] })).toBe('O');
        });

        test('does not warn when user is outside the school', () => {
            expect(getRestrictionToWarn({ restrictions: 'O', courseSchool: ICS, userSchools: [ENG] })).toBeNull();
        });
    });

    describe('L: limited to certain majors', () => {
        test('warns when user is outside the school', () => {
            expect(getRestrictionToWarn({ restrictions: 'L', courseSchool: ICS, userSchools: [ENG] })).toBe('L');
        });

        test('does not warn when user is in the school', () => {
            expect(getRestrictionToWarn({ restrictions: 'L', courseSchool: ICS, userSchools: [ICS] })).toBeNull();
        });
    });

    describe('M: not open to some majors in the school', () => {
        test('warns when user is in the school', () => {
            expect(getRestrictionToWarn({ restrictions: 'M', courseSchool: ICS, userSchools: [ICS] })).toBe('M');
        });

        test('does not warn when user is outside the school', () => {
            expect(getRestrictionToWarn({ restrictions: 'M', courseSchool: ICS, userSchools: [ENG] })).toBeNull();
        });
    });

    describe('multiple user schools', () => {
        test('counts as in-school if any user school matches', () => {
            expect(getRestrictionToWarn({ restrictions: 'N', courseSchool: ICS, userSchools: [ENG, ICS] })).toBeNull();
            expect(getRestrictionToWarn({ restrictions: 'O', courseSchool: ICS, userSchools: [ENG, ICS] })).toBe('O');
        });

        test('counts as out-of-school if no user school matches', () => {
            expect(getRestrictionToWarn({ restrictions: 'N', courseSchool: ICS, userSchools: [ENG, BIO] })).toBe('N');
        });
    });

    describe('token parsing', () => {
        test('ignores "and" / "or" tokens', () => {
            expect(getRestrictionToWarn({ restrictions: 'A and N', courseSchool: ICS, userSchools: [ENG] })).toBe('N');
            expect(getRestrictionToWarn({ restrictions: 'A or M', courseSchool: ICS, userSchools: [ICS] })).toBe('M');
        });

        test('"and" / "or" alone do not warn', () => {
            expect(getRestrictionToWarn({ restrictions: 'and or', courseSchool: ICS, userSchools: [ENG] })).toBeNull();
        });

        test('ignores codes unrelated to school/major', () => {
            expect(getRestrictionToWarn({ restrictions: 'A and B', courseSchool: ICS, userSchools: [ENG] })).toBeNull();
        });

        test('empty restrictions string does not warn', () => {
            expect(getRestrictionToWarn({ restrictions: '', courseSchool: ICS, userSchools: [ENG] })).toBeNull();
        });
    });

    describe('priority when several codes apply', () => {
        test('N beats L when outside the school', () => {
            expect(getRestrictionToWarn({ restrictions: 'L and N', courseSchool: ICS, userSchools: [ENG] })).toBe('N');
        });

        test('O beats M when inside the school', () => {
            expect(getRestrictionToWarn({ restrictions: 'M or O', courseSchool: ICS, userSchools: [ICS] })).toBe('O');
        });

        test('only codes matching the user side are returned', () => {
            expect(getRestrictionToWarn({ restrictions: 'N and M', courseSchool: ICS, userSchools: [ICS] })).toBe('M');
            expect(getRestrictionToWarn({ restrictions: 'O and L', courseSchool: ICS, userSchools: [ENG] })).toBe('L');
        });
    });
});
