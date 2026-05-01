import { describe, expect, test, vi } from 'vitest';

vi.mock('$lib/api/trpc', () => ({ default: {} }));

import { findDefaultEnrollmentHistoryIndex, type EnrollmentHistory } from '$lib/enrollmentHistory';

function entry(
    year: string,
    quarter: string,
    sectionCode: string,
    instructors: string[]
): EnrollmentHistory {
    return {
        year,
        quarter,
        department: 'I&C SCI',
        courseNumber: '45C',
        sectionCode,
        days: [],
        instructors,
    };
}

describe('findDefaultEnrollmentHistoryIndex', () => {
    test('prefers same term, section, and instructor overlap', () => {
        const history: EnrollmentHistory[] = [
            entry('2024', 'Fall', 'A', ['SMITH, J.']),
            entry('2025', 'Winter', 'B', ['DOE, J.']),
            entry('2025', 'Fall', 'A', ['DOE, J.', 'LEE, K.']),
        ];
        const idx = findDefaultEnrollmentHistoryIndex(history, {
            termShortName: '2025 Fall',
            sectionCode: 'a',
            instructors: ['DOE, J.'],
        });
        expect(idx).toBe(2);
    });

    test('falls back to newest when term does not match any row', () => {
        const history: EnrollmentHistory[] = [
            entry('2024', 'Fall', 'A', ['SMITH, J.']),
            entry('2025', 'Winter', 'B', ['DOE, J.']),
        ];
        const idx = findDefaultEnrollmentHistoryIndex(history, {
            termShortName: '2099 Spring',
            sectionCode: 'Z',
            instructors: ['NOBODY, X.'],
        });
        expect(idx).toBe(1);
    });

    test('uses instructor overlap when section code differs across terms', () => {
        const history: EnrollmentHistory[] = [
            entry('2025', 'Fall', 'A', ['LEE, K.']),
            entry('2025', 'Fall', 'B', ['DOE, J.']),
        ];
        const idx = findDefaultEnrollmentHistoryIndex(history, {
            termShortName: '2025 Fall',
            sectionCode: 'C',
            instructors: ['DOE, J.'],
        });
        expect(idx).toBe(1);
    });
});
