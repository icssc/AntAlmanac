import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { WebsocTerm } from '@packages/anteater-api-types';

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_URL = 'https://anteaterapi.com/v2/rest/websoc/terms';
const OUTPUT_PATH = resolve(__dirname, '../src/generated/deployed_terms.json');

async function updateTerms() {
    try {
        console.log(`Fetching terms from ${API_URL}...`);
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const json = (await response.json()) as { data: WebsocTerm[] };
        const data = json.data;

        if (!data || data.length === 0) {
            throw new Error('API returned empty data');
        }

        const latestTerm = data[0];
        console.log(`Latest term from API: ${latestTerm.longName}`);

        let currentTermName = '';

        if (existsSync(OUTPUT_PATH)) {
            const currentFile = readFileSync(OUTPUT_PATH, 'utf-8');
            const currentData = JSON.parse(currentFile) as { data: WebsocTerm[] };
            currentTermName = currentData.data?.[0]?.longName || '';
            console.log(`Current deployed term: ${currentTermName}`);
        } else {
            console.log('No existing deployed_terms.json found. Creating new one.');
        }

        if (latestTerm.longName !== currentTermName) {
            console.log('New term detected! Updating file...');
            writeFileSync(OUTPUT_PATH, JSON.stringify(json, null, 4));
            console.log(`Updated ${OUTPUT_PATH}`);
        } else {
            console.log('Terms are up to date. No changes needed.');
        }
    } catch (error) {
        console.error('Error updating terms:', error);
        process.exit(1);
    }
}

updateTerms();
