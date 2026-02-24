/**
 * NB: This script exists in both apps/antalmanac and apps/backend
 * for the purpose of fetching and processing term data from the Anteater API.
 * If you're making changes to the logic in one location, you most likely
 * should make the corresponding changes in the other to maintain consistency.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { CalendarTerm } from '@packages/antalmanac-types';

const PUBLIC_ANTEATER_API_KEY = 'INSqn9qP1pXlEwihpQa_GtrJhGOxQyjE5zcAKYLptLg.pk.prj9hlf3sf7q638jkq61u282';
const __dirname = dirname(fileURLToPath(import.meta.url));

const OUTPUT_DIR = join(__dirname, '../src/generated/');
const OUTPUT_FILE = join(OUTPUT_DIR, 'termData.ts');

const API_URL = 'https://anteaterapi.com/v2/rest/calendar/all';
const ORIGIN = 'https://antalmanac.com';

const QUARTER_MAP = {
    Summer1: 'Summer Session 1',
    Summer10wk: '10-wk Summer',
    Summer2: 'Summer Session 2',
    Fall: 'Fall Quarter',
    Winter: 'Winter Quarter',
    Spring: 'Spring Quarter',
} as const;

function sanitizeTermName(year: string, quarter: keyof typeof QUARTER_MAP): `${string} ${string}` {
    return `${year} ${QUARTER_MAP[quarter]}`;
}

async function fetchCalendarTerms(): Promise<CalendarTerm[]> {
    const res = await fetch(API_URL, {
        headers: {
            Authorization: `Bearer ${PUBLIC_ANTEATER_API_KEY}`,
            Origin: ORIGIN,
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch terms: ${res.statusText}`);
    }

    const { data } = await res.json();
    return data;
}

function toLocalDateCode(dateString: string): string {
    const [year, month, day] = dateString.split('-').map(Number);
    // 0-indexed months
    return `new Date(${year}, ${month - 1}, ${day})`;
}

function serializeTerm(term: CalendarTerm): string {
    const { year, quarter, instructionStart, finalsStart, socAvailable } = term;

    if (!instructionStart || !finalsStart || !socAvailable) {
        throw new Error(`Term ${year} ${quarter} is missing required date fields`);
    }

    const shortName = `${year} ${quarter}`;
    const longName = sanitizeTermName(year, quarter);
    const isSummerTerm = quarter.toLowerCase().includes('summer');

    return `    {
        shortName: ${JSON.stringify(shortName)},
        longName: ${JSON.stringify(longName)},
        startDate: ${toLocalDateCode(instructionStart)},
        finalsStartDate: ${toLocalDateCode(finalsStart)},
        socAvailable: ${toLocalDateCode(socAvailable)},
        isSummerTerm: ${isSummerTerm},
    }`;
}

async function main() {
    console.log('Fetching all calendar terms from Anteater API...');
    const calendarTerms = await fetchCalendarTerms();
    console.log(`Fetched ${calendarTerms?.length} calendar terms.`);

    const sortedTerms = calendarTerms
        .filter((term) => Number(term.year) >= 2026)
        .sort((a, b) => {
            const dateA = new Date(a.instructionStart).getTime();
            const dateB = new Date(b.instructionStart).getTime();
            return dateB - dateA;
        });

    const termEntries = sortedTerms.map(serializeTerm).join(',\n');
    const fileContent = `import type { Term } from '$lib/termData';

export const terms: Term[] = [
${termEntries}
];
    `;

    await mkdir(OUTPUT_DIR, { recursive: true });
    await writeFile(OUTPUT_FILE, fileContent);

    console.log('Term data generated. Written to ', OUTPUT_FILE);
}

main();
