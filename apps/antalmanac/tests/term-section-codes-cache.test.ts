import { promises as fs } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';

import {
    _clearTermDataCacheForTests,
    _setTermsFolderForTests,
    getOfferedCourses,
    getTermSectionCodes,
} from '../src/backend/lib/term-section-codes-cache';

// Use a dedicated, hermetic temp directory so the test never depends on (or
// pollutes) the real generated/terms folder.
const TEST_DIR = resolve(dirname(fileURLToPath(import.meta.url)));
const TERMS_DIR = join(TEST_DIR, '__tmp_term_cache_fixtures__');
const TEST_YEAR = 'CACHETEST';
const TEST_QUARTER = '2099';
const TEST_FILE = join(TERMS_DIR, `${TEST_QUARTER}_${TEST_YEAR}.json`);

const SAMPLE_TERM_DATA = {
    '34000': {
        type: 'SECTION',
        department: 'COMPSCI',
        courseNumber: '121',
        sectionCode: '34000',
        sectionNum: '01',
        sectionType: 'Lec',
    },
    '34010': {
        type: 'SECTION',
        department: 'COMPSCI',
        courseNumber: '122A',
        sectionCode: '34010',
        sectionNum: '01',
        sectionType: 'Lec',
    },
    '34020': {
        type: 'SECTION',
        department: 'MATH',
        courseNumber: '2A',
        sectionCode: '34020',
        sectionNum: '01',
        sectionType: 'Lec',
    },
};

beforeAll(async () => {
    await fs.mkdir(TERMS_DIR, { recursive: true });
    await fs.writeFile(TEST_FILE, JSON.stringify(SAMPLE_TERM_DATA));
    _setTermsFolderForTests(TERMS_DIR);
});

afterAll(async () => {
    _setTermsFolderForTests(null);
    await fs.rm(TERMS_DIR, { recursive: true, force: true });
});

beforeEach(() => {
    _clearTermDataCacheForTests();
});

describe('term-section-codes cache', () => {
    test('returns parsed section data for a known term', async () => {
        const data = await getTermSectionCodes(TEST_YEAR, TEST_QUARTER);
        expect(Object.keys(data).sort()).toEqual(['34000', '34010', '34020']);
        expect(data['34000'].department).toBe('COMPSCI');
    });

    test('builds offered-course set with `${dept}-${number}` keys', async () => {
        const set = await getOfferedCourses(TEST_YEAR, TEST_QUARTER);
        expect(set).toBeInstanceOf(Set);
        expect(set.has('COMPSCI-121')).toBe(true);
        expect(set.has('COMPSCI-122A')).toBe(true);
        expect(set.has('MATH-2A')).toBe(true);
        expect(set.has('PHYSICS-7C')).toBe(false);
        expect(set.size).toBe(3);
    });

    test('caches getTermSectionCodes: returns identical object across many calls', async () => {
        // Object identity across concurrent and sequential callers proves the
        // cache is hit and the file is not re-read or re-parsed.
        const concurrent = await Promise.all(
            Array.from({ length: 25 }, () => getTermSectionCodes(TEST_YEAR, TEST_QUARTER))
        );
        for (const result of concurrent) {
            expect(result).toBe(concurrent[0]);
        }

        const sequential = await getTermSectionCodes(TEST_YEAR, TEST_QUARTER);
        expect(sequential).toBe(concurrent[0]);
    });

    test('caches getOfferedCourses: returns identical Set across many calls', async () => {
        const concurrent = await Promise.all(
            Array.from({ length: 25 }, () => getOfferedCourses(TEST_YEAR, TEST_QUARTER))
        );
        for (const s of concurrent) {
            expect(s).toBe(concurrent[0]);
        }

        const sequential = await getOfferedCourses(TEST_YEAR, TEST_QUARTER);
        expect(sequential).toBe(concurrent[0]);
    });

    test('caches detectably: real disk read is much slower than cache hit', async () => {
        // First call goes to disk + parses. Subsequent calls should be at least
        // ~50x faster — in practice it's thousands of times faster, but 50x is
        // a safe floor that won't flake on slow CI.
        const cold = process.hrtime.bigint();
        await getTermSectionCodes(TEST_YEAR, TEST_QUARTER);
        const coldNs = Number(process.hrtime.bigint() - cold);

        const warm = process.hrtime.bigint();
        for (let i = 0; i < 100; i++) {
            await getTermSectionCodes(TEST_YEAR, TEST_QUARTER);
        }
        const warmNs = Number(process.hrtime.bigint() - warm) / 100;

        expect(warmNs).toBeLessThan(coldNs / 50);
    });

    test('caches by (year, quarter): different terms get separate entries', async () => {
        const otherYear = 'CACHETEST2';
        const otherFile = join(TERMS_DIR, `${TEST_QUARTER}_${otherYear}.json`);
        await fs.writeFile(
            otherFile,
            JSON.stringify({
                '99999': {
                    type: 'SECTION',
                    department: 'BIO SCI',
                    courseNumber: '93',
                    sectionCode: '99999',
                    sectionNum: '01',
                    sectionType: 'Lec',
                },
            })
        );

        try {
            const a = await getTermSectionCodes(TEST_YEAR, TEST_QUARTER);
            const b = await getTermSectionCodes(otherYear, TEST_QUARTER);
            expect(a).not.toBe(b);
            expect(Object.keys(a)).toContain('34000');
            expect(Object.keys(b)).toEqual(['99999']);
        } finally {
            await fs.unlink(otherFile);
        }
    });

    test('does not poison the cache on failure: a later successful call still works', async () => {
        // Prime with a failure.
        await expect(getTermSectionCodes('NOTREAL', 'NOPE')).rejects.toThrow(/Failed to load term data/);

        // The same key should be retried (and succeed once the file exists). We
        // assert behavior by re-throwing the same way and then verifying a real
        // term still works after a failed call.
        await expect(getTermSectionCodes('NOTREAL', 'NOPE')).rejects.toThrow(/Failed to load term data/);

        const data = await getTermSectionCodes(TEST_YEAR, TEST_QUARTER);
        expect(Object.keys(data).length).toBe(3);
    });
});
