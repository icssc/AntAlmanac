import { appendFile } from 'node:fs/promises';

import { parseTermShortName } from '$lib/termHelpers';
import { env } from '$scripts/env';
import { createClient } from '@packages/anteater-api/client';
import type { WebsocTerm } from '@packages/anteater-api/types';
import { flattenSections } from '@packages/anteater-api/utils';

const aapiClient = createClient({ apiKey: env.ANTEATER_API_KEY });

async function getSectionCount(term: WebsocTerm) {
    const { shortName } = term;
    const parsed = parseTermShortName(shortName);
    if (!parsed) {
        throw new Error(`Invalid term shortName from API: ${shortName}`);
    }
    const { year, quarter } = parsed;
    console.log(`Checking section count for ${shortName}...`);
    const response = await aapiClient.websoc.query({ year, quarter });
    return flattenSections(response).length;
}

async function getLatestTerm() {
    try {
        console.log('Fetching terms from Anteater API...');
        const terms = await aapiClient.websoc.getTerms();

        if (!terms.length) {
            throw new Error('API returned empty term data');
        }

        const latestTerm = terms[0].longName;
        const sectionCount = await getSectionCount(terms[0]);

        console.log(`Latest term from API: ${latestTerm}`);
        console.log(`Total sections from API: ${sectionCount}`);

        const outputFile = process.env.GITHUB_OUTPUT;
        if (outputFile) {
            await appendFile(outputFile, `latest-term=${latestTerm}\nsection-count=${sectionCount}\n`);
        }
    } catch (error) {
        console.error('Error getting latest term:', error);
        process.exit(1);
    }
}

getLatestTerm();
