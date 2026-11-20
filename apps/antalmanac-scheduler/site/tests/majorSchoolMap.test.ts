import generatedMajors from '$generated/majors.json';
import { MAJOR_SCHOOLS_MAP, type School, getSchoolsFromMajors } from '@packages/antalmanac-types';
import { describe, expect, test } from 'vitest';

const ICS: School = 'Donald Bren School of Information and Computer Sciences';
const MERAGE: School = 'Paul Merage School of Business';

const ALL_MAJOR_IDS = Object.keys(generatedMajors);

describe('MAJOR_SCHOOLS_MAP', () => {
    test('has at least one school for every major in majors.json', () => {
        const missing = ALL_MAJOR_IDS.filter((id) => !MAJOR_SCHOOLS_MAP[id]?.length);
        expect(missing).toEqual([]);
    });
});

describe('getSchoolsFromMajors', () => {
    test('returns an empty list for no majors', () => {
        expect(getSchoolsFromMajors([])).toEqual([]);
    });

    test('returns the school for one major', () => {
        expect(getSchoolsFromMajors(['BS-201'])).toEqual([ICS]);
    });

    test('removes duplicate schools across majors', () => {
        expect(getSchoolsFromMajors(['BS-201', 'BS-19H'])).toEqual([ICS]);
    });

    test('returns every school for a major in more than one school', () => {
        expect(getSchoolsFromMajors(['BS-01N'])).toEqual([ICS, MERAGE]);
    });

    test('ignores unknown major ids', () => {
        expect(getSchoolsFromMajors(['FAKE-1', 'BS-201'])).toEqual([ICS]);
    });
});
