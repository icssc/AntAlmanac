import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';

import { isSummerQuarter, QUARTER_LONG_NAMES, QuarterSchema } from '$lib/term-constants';
import { createClient } from '@packages/anteater-api/client';
import type { CalendarTerm } from '@packages/anteater-api/types';

import { GENERATED_DIR, TERM_DATA_FILE } from './lib/paths.js';

const aapiClient = createClient({ apiKey: process.env.ANTEATER_API_KEY });

function serializeTerm(term: CalendarTerm) {
    const { year, quarter: rawQuarter, instructionStart, finalsStart, socAvailable } = term;

    if (!instructionStart || !finalsStart || !socAvailable) {
        throw new Error(`Term ${year} ${rawQuarter} is missing required date fields`);
    }

    // Validate the quarter against the 6 known values defined in term-constants.ts.
    // A ZodError here means the Anteater API returned an unrecognised quarter token.
    const quarter = QuarterSchema.parse(rawQuarter);

    const shortName = `${year} ${quarter}`;
    const longName = `${year} ${QUARTER_LONG_NAMES[quarter]}`;

    return {
        shortName,
        longName,
        startDate: instructionStart,
        finalsStartDate: finalsStart,
        socAvailable,
        isSummerTerm: isSummerQuarter(quarter),
    };
}

async function main() {
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
