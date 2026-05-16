import 'dotenv/config';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { QuarterSchema } from '@packages/antalmanac-types';
import { createClient } from '@packages/anteater-api/client';
import type { WebsocTerm } from '@packages/anteater-api/types';
import { flattenSections } from '@packages/anteater-api/utils';

import { DEPLOYED_TERMS_FILE } from './lib/paths.js';

interface DeployedTermsData {
    latestTerm: string;
    sectionCount: number;
    updatedAt?: string;
    reason?: string;
}

const aapiClient = createClient({ apiKey: process.env.ANTEATER_API_KEY });

async function getSectionCount(term: WebsocTerm) {
    const { shortName } = term;
    const [year, rawQuarter] = shortName.split(' ');
    const quarter = QuarterSchema.parse(rawQuarter);
    console.log(`Checking section count for ${shortName}...`);
    const response = await aapiClient.websoc.query({ year, quarter });
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

        try {
            const currentFile = await readFile(DEPLOYED_TERMS_FILE, 'utf-8');
            try {
                deployedData = JSON.parse(currentFile);
            } catch {
                console.log('Error parsing existing deployed_terms.json, treating as empty.');
            }
            console.log(`Current deployed term: ${deployedData.latestTerm}`);
            console.log(`Current deployed section count: ${deployedData.sectionCount}`);
        } catch (e) {
            if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw e;
            }
            console.log('No existing deployed_terms.json found.');
            await mkdir(dirname(DEPLOYED_TERMS_FILE), { recursive: true });
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
            await writeFile(DEPLOYED_TERMS_FILE, JSON.stringify(newData, null, 2), 'utf-8');
            console.log(`Updated ${DEPLOYED_TERMS_FILE}`);
        } else {
            console.log('Terms and section count are up to date. No changes needed.');
        }
    } catch (error) {
        console.error('Error updating terms:', error);
        process.exit(1);
    }
}

updateTerms();
