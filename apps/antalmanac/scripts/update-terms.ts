import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import 'dotenv/config';
import { WebsocSchool, WebsocTerm } from '@packages/antalmanac-types';

import { fetchAnteaterAPI } from '$src/backend/lib/helpers';

const __dirname = dirname(fileURLToPath(import.meta.url));

const TERMS_URL = 'https://anteaterapi.com/v2/rest/websoc/terms';
const WEBSOC_URL = 'https://anteaterapi.com/v2/rest/websoc';
const OUTPUT_PATH = resolve(__dirname, '../src/generated/deployed_terms.json');

interface DeployedTermsData {
    latestTerm: string;
    sectionCount: number;
    updatedAt?: string;
    reason?: string;
}

async function getSectionCount(term: WebsocTerm) {
    const [year, quarter] = term.shortName.split(' ');
    console.log(`Checking section count for ${year} ${quarter} from ${WEBSOC_URL}...`);

    const params = new URLSearchParams({ year, quarter });
    const json = await fetchAnteaterAPI<{ data: { schools: WebsocSchool[] } }>(`${WEBSOC_URL}?${params.toString()}`, {
        isApiKeyRequired: true,
    });

    let count = 0;
    for (const school of json.data.schools) {
        for (const dept of school.departments) {
            for (const course of dept.courses) {
                count += course.sections.length;
            }
        }
    }
    return count;
}

async function updateTerms() {
    try {
        console.log(`Fetching terms from ${TERMS_URL}...`);
        const termsJson = await fetchAnteaterAPI<{ data: WebsocTerm[] }>(TERMS_URL, { isApiKeyRequired: true });

        const data = termsJson.data;

        if (!data || data.length === 0) {
            throw new Error('API returned empty term data');
        }

        const latestTerm = data[0].longName;
        const currentCount = await getSectionCount(data[0]);

        console.log(`Latest term from API: ${latestTerm}`);
        console.log(`Total sections from API: ${currentCount}`);

        let deployedData: DeployedTermsData = { latestTerm: '', sectionCount: 0 };

        if (existsSync(OUTPUT_PATH)) {
            const currentFile = readFileSync(OUTPUT_PATH, 'utf-8');
            try {
                deployedData = JSON.parse(currentFile);
            } catch (e) {
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
