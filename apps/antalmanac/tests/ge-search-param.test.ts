import { ANY_GE, GE_OPTIONS, isGeOption } from '$components/RightPane/CoursePane/SearchForm/constants';
import { DEFAULT_FORM_DATA } from '$components/RightPane/CoursePane/SearchParams/defaults';
import { hasManualParams, isValidSearch } from '$components/RightPane/CoursePane/SearchParams/helpers';
import { loadCourseSearchParams } from '$components/RightPane/CoursePane/SearchParams/loaders';
import {
    courseSearchParamParsers,
    serializeCourseSearchParams,
} from '$components/RightPane/CoursePane/SearchParams/parsers';
import { WEBSOC_GE_OPTIONS } from '@packages/antalmanac-types';
import { describe, expect, test } from 'vitest';

const geParser = courseSearchParamParsers.ge;

describe('ge search param (nuqs array of enum)', () => {
    test('GE_OPTIONS matches the shared enum (no ANY sentinel stored)', () => {
        expect(GE_OPTIONS.map((option) => option.value)).toEqual([...WEBSOC_GE_OPTIONS]);
        expect(GE_OPTIONS.map((option) => option.value)).not.toContain(ANY_GE);
    });

    test('isGeOption narrows valid codes only', () => {
        expect(isGeOption('GE-2')).toBe(true);
        expect(isGeOption('GE-5A')).toBe(true);
        expect(isGeOption('ANY')).toBe(false);
        expect(isGeOption('GE-99')).toBe(false);
        expect(isGeOption('')).toBe(false);
    });

    test('parses a comma-separated list into an enum array', () => {
        expect(geParser.parse('GE-2,GE-4')).toEqual(['GE-2', 'GE-4']);
    });

    test('drops unknown codes when parsing', () => {
        expect(geParser.parse('GE-2,BOGUS,GE-5B')).toEqual(['GE-2', 'GE-5B']);
    });

    test('defaults to an empty selection', () => {
        expect(geParser.defaultValue).toEqual([]);
    });

    test('round-trips through the serializer', () => {
        const query = serializeCourseSearchParams({ ...DEFAULT_FORM_DATA, ge: ['GE-3', 'GE-7'] });
        expect(query).toContain('ge=GE-3,GE-7');
        expect(loadCourseSearchParams(query).ge).toEqual(['GE-3', 'GE-7']);
    });

    test('an empty GE selection is omitted from the serialized query', () => {
        const query = serializeCourseSearchParams({ ...DEFAULT_FORM_DATA, ge: [] });
        expect(query).not.toContain('ge=');
    });

    test('reads a single GE from the URL', () => {
        expect(loadCourseSearchParams('?ge=GE-1A').ge).toEqual(['GE-1A']);
    });
});

describe('search validity with a GE array', () => {
    test('no GE selected is not a valid search on its own', () => {
        expect(isValidSearch({ ...DEFAULT_FORM_DATA, ge: [] })).toBe(false);
        expect(hasManualParams({ ...DEFAULT_FORM_DATA, ge: [] })).toBe(false);
    });

    test('any GE selection makes the search valid', () => {
        expect(isValidSearch({ ...DEFAULT_FORM_DATA, ge: ['GE-2'] })).toBe(true);
        expect(hasManualParams({ ...DEFAULT_FORM_DATA, ge: ['GE-2'] })).toBe(true);
    });
});
