import 'dotenv/config';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { AATerm } from '@packages/antalmanac-types';
import { createClient } from '@packages/anteater-api/client';
import type { CalendarTerm, Quarter, Year } from '@packages/anteater-api/types';

import { GENERATED_DIR, TERM_DATA_FILE } from './lib/paths.js';

/** Package root: derive from this file (`…/scripts/fetch-term-data.ts`), not `paths.ts`, so tooling cannot point `import.meta.url` at a different tree than `apps/antalmanac`. */
const ANTALMANAC_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const LEGACY_TERM_DATA_FILES = ['termData.ts', 'termData.js', 'termData.d.ts'].map((name) =>
    join(ANTALMANAC_ROOT, 'src/lib', name)
);

const aapiClient = createClient({ apiKey: process.env.ANTEATER_API_KEY });

const QUARTER_MAP = {
    Summer1: 'Summer Session 1',
    Summer10wk: '10-wk Summer',
    Summer2: 'Summer Session 2',
    Fall: 'Fall Quarter',
    Winter: 'Winter Quarter',
    Spring: 'Spring Quarter',
} as const satisfies Record<Quarter, string>;

function sanitizeTermName(year: Year, quarter: Quarter): AATerm['longName'] {
    return `${year} ${QUARTER_MAP[quarter]}`;
}

function serializeTerm(term: CalendarTerm) {
    const { year, quarter, instructionStart, finalsStart, socAvailable } = term;

    if (!instructionStart || !finalsStart || !socAvailable) {
        throw new Error(`Term ${year} ${quarter} is missing required date fields`);
    }

    const shortName = `${year} ${quarter}`;
    const longName = sanitizeTermName(year, quarter);
    const isSummerTerm = quarter.toLowerCase().includes('summer');

    return {
        ...term,
        shortName,
        longName,
        isSummerTerm,
    };
}

async function removeLegacyTermDataFiles() {
    for (const filePath of LEGACY_TERM_DATA_FILES) {
        try {
            await rm(filePath);
            console.log(`Removed legacy ${filePath} (replaced by term.ts + generated termData.json).`);
        } catch (e) {
            if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw e;
            }
        }
    }
}

async function main() {
    await removeLegacyTermDataFiles();

    console.log('Fetching all calendar terms from Anteater API...');
    const calendarTerms = await aapiClient.calendar.all();
    console.log(`Fetched ${calendarTerms.length} calendar terms.`);

    const sortedTerms = calendarTerms.sort((a: CalendarTerm, b: CalendarTerm) => {
        const dateA = new Date(a.instructionStart).getTime();
        const dateB = new Date(b.instructionStart).getTime();
        return dateB - dateA;
    });

    const termEntries = sortedTerms.map(serializeTerm);

    await mkdir(GENERATED_DIR, { recursive: true });
    await writeFile(TERM_DATA_FILE, JSON.stringify(termEntries, null, 2));

    console.log('Term data generated. Written to ', TERM_DATA_FILE);
}

main();
