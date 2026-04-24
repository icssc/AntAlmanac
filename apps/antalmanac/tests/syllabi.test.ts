import {
    formatTermLabel,
    groupByProfessor,
    groupByTerm,
    isCurrentOffering,
    parseTermShortName,
    pickCurrentTermOfferings,
} from '$lib/syllabi';
import type { Syllabus } from '@packages/antalmanac-types';
import { describe, expect, test } from 'vitest';

const syllabus = (year: string, quarter: Syllabus['quarter'], url: string, names: string[]): Syllabus => ({
    year,
    quarter,
    url,
    instructorNames: names,
});

describe('parseTermShortName', () => {
    test('parses shortName from RightPaneStore.formData.term', () => {
        expect(parseTermShortName('2025 Fall')).toEqual({ year: '2025', quarter: 'Fall' });
        expect(parseTermShortName('2026 Summer1')).toEqual({ year: '2026', quarter: 'Summer1' });
    });

    test('falls back to today when undefined', () => {
        const parsed = parseTermShortName(undefined);
        expect(parsed.year).toMatch(/^\d{4}$/);
        expect(['Fall', 'Winter', 'Spring', 'Summer1', 'Summer10wk', 'Summer2']).toContain(parsed.quarter);
    });
});

describe('isCurrentOffering', () => {
    test('matches both year and quarter', () => {
        const s = syllabus('2025', 'Fall', 'u1', ['SHINDLER, M.']);
        expect(isCurrentOffering(s, { year: '2025', quarter: 'Fall' })).toBe(true);
        expect(isCurrentOffering(s, { year: '2025', quarter: 'Winter' })).toBe(false);
        expect(isCurrentOffering(s, { year: '2024', quarter: 'Fall' })).toBe(false);
    });
});

describe('pickCurrentTermOfferings', () => {
    test('returns every offering in the current term (multi-section same term)', () => {
        const data = [
            syllabus('2025', 'Fall', 'a', ['PATTIS, R.']),
            syllabus('2025', 'Fall', 'b', ['SHINDLER, M.']),
            syllabus('2024', 'Fall', 'c', ['SHINDLER, M.']),
        ];
        expect(pickCurrentTermOfferings(data, { year: '2025', quarter: 'Fall' })).toHaveLength(2);
    });
});

describe('groupByTerm', () => {
    test('sorts newest first and preserves same-term rows', () => {
        const data = [
            syllabus('2023', 'Winter', 'a', ['A']),
            syllabus('2025', 'Fall', 'b', ['B']),
            syllabus('2025', 'Fall', 'c', ['C']),
            syllabus('2024', 'Spring', 'd', ['D']),
        ];
        const groups = groupByTerm(data);
        expect(groups.map((g) => g.label)).toEqual(['Fall 2025', 'Spring 2024', 'Winter 2023']);
        expect(groups[0].items).toHaveLength(2);
    });
});

describe('groupByProfessor', () => {
    test('elevates professors teaching the current quarter', () => {
        const data = [
            syllabus('2024', 'Fall', 'a', ['PATTIS, R.']),
            syllabus('2025', 'Fall', 'b', ['SHINDLER, M.']),
            syllabus('2023', 'Winter', 'c', ['ZZZ, X.']),
        ];
        const groups = groupByProfessor(data, { year: '2025', quarter: 'Fall' });
        expect(groups[0].instructor).toBe('SHINDLER, M.');
        expect(groups[0].teachingCurrentTerm).toBe(true);
        expect(groups.slice(1).map((g) => g.instructor)).toEqual(['PATTIS, R.', 'ZZZ, X.']);
    });

    test('a co-taught syllabus appears under each instructor', () => {
        const data = [syllabus('2025', 'Fall', 'a', ['A', 'B'])];
        const groups = groupByProfessor(data, { year: '2025', quarter: 'Fall' });
        expect(groups.map((g) => g.instructor).sort()).toEqual(['A', 'B']);
    });

    test('within a professor group, items are newest-first', () => {
        const data = [
            syllabus('2022', 'Fall', 'a', ['X']),
            syllabus('2024', 'Winter', 'b', ['X']),
            syllabus('2023', 'Spring', 'c', ['X']),
        ];
        const groups = groupByProfessor(data, { year: '2099', quarter: 'Fall' });
        expect(groups[0].items.map((i) => `${i.year} ${i.quarter}`)).toEqual([
            '2024 Winter',
            '2023 Spring',
            '2022 Fall',
        ]);
    });
});

describe('formatTermLabel', () => {
    test('formats standard and summer quarters', () => {
        expect(formatTermLabel('2025', 'Fall')).toBe('Fall 2025');
        expect(formatTermLabel('2025', 'Summer1')).toBe('Summer Session 1 2025');
        expect(formatTermLabel('2025', 'Summer10wk')).toBe('10-wk Summer 2025');
    });
});
