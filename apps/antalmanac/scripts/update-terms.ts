import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@packages/anteater-api/client';
import type { WebsocTerm } from '@packages/anteater-api/types';
import { flattenSections } from '@packages/anteater-api/utils';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

const OUTPUT_PATH = resolve(__dirname, '../src/generated/deployed_terms.json');

interface DeployedTermsData {
    latestTerm: string;
    sectionCount: number;
    updatedAt?: string;
    reason?: string;
}

const aapiClient = createClient({ apiKey: process.env.ANTEATER_API_KEY });

async function getSectionCount(term: WebsocTerm) {
    const [year, quarter] = term.shortName.split(' ');
    console.log(`Checking section count for ${year} ${quarter}...`);
    const response = await aapiClient.websoc.query({
        year,
        quarter,
    } as Parameters<typeof aapiClient.websoc.query>[0]);
    return flattenSections(response).length;
}

async function updateTerms() {
    try {
        console.log('Fetching terms from Anteater API...');
        const terms = await aapiClient.websoc.getTerms();

        if (!terms.length) {
            throw new Error('API returned empty term data');
        }

        const latestTerm = terms[0].longName;
        const currentCount = await getSectionCount(terms[0]);

        console.log(`Latest term from API: ${latestTerm}`);
        console.log(`Total sections from API: ${currentCount}`);

        let deployedData: DeployedTermsData = { latestTerm: '', sectionCount: 0 };

        if (existsSync(OUTPUT_PATH)) {
            const currentFile = readFileSync(OUTPUT_PATH, 'utf-8');
            try {
                deployedData = JSON.parse(currentFile);
            } catch {
                console.log('Error parsing existing deployed_terms.json, treating as empty.');
            }
            console.log(`Current deployed term: ${deployedData.latestTerm}`);
            console.log(`Current deployed section count: ${deployedData.sectionCount}`);
        } else {
            console.log('No existing deployed_terms.json found.');
            mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
        }

        const termChanged = latestTerm !== deployedData.latestTerm;
        const countChanged = currentCount !== deployedData.sectionCount;

        if (termChanged || countChanged) {
            console.log('Update needed! Updating file...');
            const reasons = [termChanged && 'New term detected', countChanged && 'Section count changed']
                .filter(Boolean)
                .join('; ');

            const newData: DeployedTermsData = {
                latestTerm,
                sectionCount: currentCount,
                updatedAt: new Date().toISOString(),
                reason: reasons,
            };
            writeFileSync(OUTPUT_PATH, JSON.stringify(newData, null, 2));
            console.log(`Updated ${OUTPUT_PATH}`);
        } else {
            console.log('Terms and section count are up to date. No changes needed.');
        }
    } catch (error) {
        console.error('Error updating terms:', error);
        process.exit(1);
    }
}

updateTerms();
